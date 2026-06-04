package com.emailassistant.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Service
public class AiService {

    @Value("${ai.provider:gemini}")
    private String provider;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${openai.api.key}")
    private String openaiApiKey;

    @Value("${openai.api.url}")
    private String openaiApiUrl;

    @Value("${openai.model:gpt-4o-mini}")
    private String openaiModel;

    private final WebClient webClient;

    public AiService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String generateResponse(String emailContent) {
        String prompt = "Generate a professional, context-aware, and polite response for this email:\n\n" + emailContent;

        if ("openai".equalsIgnoreCase(provider)) {
            return generateOpenAiResponse(prompt);
        } else {
            return generateGeminiResponse(prompt);
        }
    }

    public Map<String, String> generateEmailAnalysis(String emailContent, String userName) {
        String senderName = (userName != null && !userName.trim().isEmpty()) ? userName.trim() : "the sender";
        String prompt = "Analyze the following incoming email content. You MUST return a valid JSON object ONLY, with no extra text or markdown formatting. The JSON object MUST contain exactly these keys:\n"
                + "1. \"sentiment\": A string indicating the sentiment of the email. Choose from: \"Urgent\", \"Neutral\", \"Appreciation\", \"Disappointment\".\n"
                + "2. \"urgency\": A string indicating the priority level. Choose from: \"High\", \"Medium\", \"Low\".\n"
                + "3. \"generatedResponse\": A high-quality, professional reply to this email, adhering strictly to any [Tone Guideline] mentioned in the content. "
                + "IMPORTANT: Sign the reply with the name \"" + senderName + "\" — do NOT use placeholder text like [Your Name].\n\n"
                + "Ensure that the JSON is properly formatted and closed. Do not wrap the JSON in ```json markdown codeblocks.\n\n"
                + "Email Content & Guidelines:\n" + emailContent;

        String rawResponse;
        if ("openai".equalsIgnoreCase(provider)) {
            rawResponse = generateOpenAiResponse(prompt);
        } else {
            rawResponse = generateGeminiResponse(prompt);
        }

        return parseAiAnalysisJson(rawResponse);
    }

    public String generateChatResponse(String message, String chatHistory) {
        String prompt = "You are MailJet Assistant, a helpful, polite, and professional AI chatbot integrated into MailJet (a Smart Email Assistant application).\n"
                + "You help users learn how to use MailJet, explain its features (such as Gmail sync, dynamic response editing, tone sliders for Casual/Formal, Gentle/Bold, Detailed/Brief), and give helpful general email writing tips.\n"
                + "Keep your answers engaging, polite, concise, and helpful. Use simple formatting (like bullet points or short paragraphs) so it looks good in a chat widget.\n\n"
                + "Conversation History:\n" + chatHistory + "\n\n"
                + "User: " + message + "\n"
                + "MailJet Assistant:";

        if ("openai".equalsIgnoreCase(provider)) {
            return generateOpenAiResponse(prompt);
        } else {
            return generateGeminiResponse(prompt);
        }
    }

    private String generateGeminiResponse(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        try {
            Map response = webClient.post()
                    .uri(geminiApiUrl + "?key=" + geminiApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            return extractTextFromGemini(response);
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            return "Error generating Gemini response (API returned " + e.getStatusCode() + "): " + e.getResponseBodyAsString();
        } catch (Exception e) {
            return "Error generating Gemini response: " + e.getMessage();
        }
    }

    private String generateOpenAiResponse(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "model", openaiModel,
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)
                )
        );

        try {
            Map response = webClient.post()
                    .uri(openaiApiUrl)
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + openaiApiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            return extractTextFromOpenAi(response);
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            return "Error generating OpenAI response (API returned " + e.getStatusCode() + "): " + e.getResponseBodyAsString();
        } catch (Exception e) {
            return "Error generating OpenAI response: " + e.getMessage();
        }
    }

    private String extractTextFromGemini(Map response) {
        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                if (parts != null && !parts.isEmpty()) {
                    return (String) parts.get(0).get("text");
                }
            }
            return "Failed to parse response from Gemini AI.";
        } catch (Exception e) {
            return "Failed to parse response from Gemini AI.";
        }
    }

    private String extractTextFromOpenAi(Map response) {
        try {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                if (message != null) {
                    return (String) message.get("content");
                }
            }
            return "Failed to parse response from OpenAI.";
        } catch (Exception e) {
            return "Failed to parse response from OpenAI.";
        }
    }

    private Map<String, String> parseAiAnalysisJson(String rawResponse) {
        String defaultSentiment = "Neutral";
        String defaultUrgency = "Medium";

        if (rawResponse == null || rawResponse.trim().isEmpty()) {
            return Map.of("sentiment", defaultSentiment, "urgency", defaultUrgency, "generatedResponse", "");
        }

        String cleanJson = rawResponse.trim();

        // Robust extraction of the JSON block
        int firstBrace = cleanJson.indexOf('{');
        int lastBrace = cleanJson.lastIndexOf('}');
        if (firstBrace != -1 && lastBrace != -1 && lastBrace > firstBrace) {
            cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
        } else {
            // No JSON braces found, fall back to returning raw response as the generated response
            return Map.of("sentiment", defaultSentiment, "urgency", defaultUrgency, "generatedResponse", rawResponse);
        }

        // Try proper JSON parsing (Jackson)
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(cleanJson);

            String sentiment = root.has("sentiment") ? root.get("sentiment").asText() : defaultSentiment;
            String urgency   = root.has("urgency")   ? root.get("urgency").asText()   : defaultUrgency;
            String generatedResponse = root.has("generatedResponse") ? root.get("generatedResponse").asText() : null;

            if (sentiment == null || sentiment.isBlank())         sentiment = defaultSentiment;
            if (urgency == null || urgency.isBlank())             urgency   = defaultUrgency;
            if (generatedResponse == null || generatedResponse.isBlank()) {
                generatedResponse = rawResponse; // fallback: show raw AI text
            }

            return Map.of("sentiment", sentiment, "urgency", urgency, "generatedResponse", generatedResponse);
        } catch (Exception jacksonEx) {
            // Fall back to regex parsing before giving up
            try {
                String sentiment = extractJsonValue(cleanJson, "sentiment");
                String urgency = extractJsonValue(cleanJson, "urgency");
                String generatedResponse = extractJsonValue(cleanJson, "generatedResponse");

                if (sentiment == null || sentiment.isBlank())         sentiment = defaultSentiment;
                if (urgency == null || urgency.isBlank())             urgency   = defaultUrgency;
                if (generatedResponse == null || generatedResponse.isBlank()) {
                    generatedResponse = rawResponse;
                }
                return Map.of("sentiment", sentiment, "urgency", urgency, "generatedResponse", generatedResponse);
            } catch (Exception regexEx) {
                // Jackson and regex failed — return raw text
                return Map.of("sentiment", defaultSentiment, "urgency", defaultUrgency, "generatedResponse", rawResponse);
            }
        }
    }

    private String extractJsonValue(String json, String key) {
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\"" + key + "\"\\s*:\\s*\"(.*?)\"(?:,|\\s*})", java.util.regex.Pattern.DOTALL);
        java.util.regex.Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            String value = matcher.group(1);
            value = value.replace("\\\"", "\"")
                         .replace("\\n", "\n")
                         .replace("\\t", "\t")
                         .replace("\\\\", "\\");
            return value.trim();
        }
        return null;
    }
}

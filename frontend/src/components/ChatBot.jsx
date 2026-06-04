import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from '../services/api';
import Logo from './Logo';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('chat_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved chat messages', e);
      }
    }
    return [
      {
        id: 'welcome',
        sender: 'bot',
        text: 'Hi there! I am your MailJet Assistant. 🚀\n\nI can help you understand how to use MailJet, explain tone sliders, Gmail inbox log syncing, or give you expert tips on drafting high-converting, professional emails. How can I help you today?',
        timestamp: new Date().toISOString(),
      },
    ];
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('chat_messages', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessageText = inputValue.trim();
    setInputValue('');
    setError(null);

    // 1. Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userMessageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // 2. Format history for AI context
    const historyString = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
      .join('\n');

    try {
      const data = await sendChatMessage(userMessageText, historyString);
      
      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.response,
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setError('Could not connect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    const welcome = [
      {
        id: 'welcome',
        sender: 'bot',
        text: 'Hi there! I am your MailJet Assistant. 🚀\n\nI can help you understand how to use MailJet, explain tone sliders, Gmail inbox log syncing, or give you expert tips on drafting high-converting, professional emails. How can I help you today?',
        timestamp: new Date().toISOString(),
      },
    ];
    setMessages(welcome);
    sessionStorage.removeItem('chat_messages');
  };

  return (
    <div className="chatbot-wrapper">
      {/* Floating Action Button (FAB) */}
      <button 
        className={`chatbot-fab ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Assistant"
        title="Chat with MailJet Assistant"
      >
        {isOpen ? (
          // Close Icon
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          // Sparkling Chat Icon
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <path d="M12 7v6"></path>
            <path d="M9 10h6"></path>
          </svg>
        )}
        {!isOpen && <span className="chatbot-fab-badge"></span>}
      </button>

      {/* Floating Chat Panel */}
      <div className={`chatbot-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-left">
            <div className="chatbot-avatar-container">
              <Logo size={18} />
            </div>
            <div className="chatbot-info">
              <h3 className="chatbot-title">MailJet Assistant</h3>
              <div className="chatbot-status">
                <span className="chatbot-status-dot"></span>
                <span>Active AI</span>
              </div>
            </div>
          </div>
          <div className="chatbot-header-actions">
            <button 
              onClick={clearChat} 
              className="chatbot-clear-btn" 
              title="Clear chat history"
              aria-label="Clear chat"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
            <button 
              onClick={() => setIsOpen(false)} 
              className="chatbot-close-btn"
              aria-label="Close panel"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Message Container */}
        <div className="chatbot-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chatbot-message-row ${msg.sender}`}>
              {msg.sender === 'bot' && (
                <div className="chatbot-msg-avatar-container">
                  <Logo size={12} />
                </div>
              )}
              <div className="chatbot-message-bubble">
                <div className="chatbot-message-text">
                  {msg.text.split('\n').map((paragraph, idx) => (
                    <p key={idx} style={{ margin: paragraph.trim() === '' ? '0.5rem 0' : '0.2rem 0' }}>
                      {paragraph}
                    </p>
                  ))}
                </div>
                <div className="chatbot-message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="chatbot-message-row bot">
              <div className="chatbot-msg-avatar-container">
                <Logo size={12} />
              </div>
              <div className="chatbot-message-bubble typing">
                <div className="chatbot-typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="chatbot-error-banner">
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Form */}
        <form onSubmit={handleSendMessage} className="chatbot-input-form">
          <input
            type="text"
            className="chatbot-input"
            placeholder="Ask MailJet Assistant..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            required
          />
          <button 
            type="submit" 
            className="chatbot-send-btn" 
            disabled={!inputValue.trim() || isLoading}
            aria-label="Send message"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;

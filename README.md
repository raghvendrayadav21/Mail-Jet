# 🚀 Mail-Jet: Smart AI Email Assistant

Mail-Jet is a premium, feature-rich web application designed to help users draft, refine, and manage their email communications using advanced AI. Powered by a Spring Boot backend and a modern React frontend, Mail-Jet allows you to generate context-aware email responses in multiple tones, track usage statistics, customize templates, and view detailed analytics.

---

## ✨ Features

### 🧠 Intelligent Email Generation
- **Context-Aware Responses**: Paste incoming emails and write a short prompt to get highly accurate draft responses.
- **Tone Customization**: Generate replies in multiple tones (e.g., *Professional*, *Casual*, *Friendly*, *Urgent*, *Apologetic*).
- **Dual AI Support**: Switch between **OpenAI/Groq** and **Google Gemini** seamlessly.

### 📋 Navigation & Sidebar Tabs
- **⚡ Generate Response**: The core workspace where you write drafts, select tones, view monthly usage stats, and generate/copy AI responses.
- **📋 Email History**: Keep a secure record of all generated emails for quick reference and search.
- **📊 Analytics Dashboard**: Beautiful custom SVG-based visual charts including:
  - **Sentiment Breakdown (Pie Chart)**: Analyzes the distribution of tones/sentiments of generated emails.
  - **7-Day Activity Trend (Bar Chart)**: Visualizes daily email generation volume over the last week.
- **✏️ Templates Manager**: Save custom email templates, edit, delete them, and load them into the main composer with a single click.
- **👤 Profile Settings**: Manage your name, account type, and change passwords securely.

### 🔒 Secure Authentication
- Full user registration and login system.
- Secure session management using **JWT (JSON Web Tokens)**.
- Secure, hashed password storage in the database.

---

## 🛠️ Tech Stack

### Backend
- **Java 21**
- **Spring Boot 3.x** (Web, Security, Data MongoDB)
- **Spring Security & JWT** (Authentication and Authorization)
- **MongoDB** (NoSQL Database for fast and scalable persistence)
- **AI Integrations**: Groq (OpenAI-compatible endpoint) & Google Gemini API

### Frontend
- **React 18** (Vite-powered for rapid HMR)
- **Vanilla CSS** (Custom CSS styling with sleek dark-mode vibes, cards, and smooth transitions)
- **Axios** (Configured with request interceptors for token-based authentication)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- **Java JDK 21**
- **Node.js** (v18 or newer)
- **MongoDB** (Running locally or an Atlas connection string)
- **Maven** (For building the Spring Boot app)

---

### 📂 Configuration & Setup

#### 1. Backend Configuration
Create or configure your environment variables for the Spring Boot backend:
- `MONGODB_URI`: Your MongoDB connection string (defaults to `mongodb://localhost:27017/emailassistant`)
- `OPENAI_API_KEY`: Your Groq/OpenAI API key
- `GEMINI_API_KEY`: Your Google Gemini API key (optional fallback)

The application properties are located in `backend/src/main/resources/application.properties` and utilize environment variable fallback placeholders:
```properties
server.port=8080
spring.data.mongodb.uri=${MONGODB_URI:mongodb://localhost:27017/emailassistant}
ai.provider=openai
openai.api.key=${OPENAI_API_KEY:}
openai.api.url=https://api.groq.com/openai/v1/chat/completions
openai.model=llama-3.1-8b-instant
```

#### 2. Frontend Configuration
The frontend automatically points to the backend API at `http://localhost:8080`. To customize this, modify `frontend/src/services/api.js`.

---

### 💻 Running the Application

#### Step 1: Start the MongoDB Server
Ensure your MongoDB instance is running:
```bash
# Example for local MongoDB on Windows (using command prompt/powershell)
net start MongoDB
```

#### Step 2: Run the Backend (Spring Boot)
Navigate to the `backend` directory and start the server:
```bash
cd backend
mvn spring-boot:run
```
The backend will start on [http://localhost:8080](http://localhost:8080).

#### Step 3: Run the Frontend (React + Vite)
Navigate to the `frontend` directory, install dependencies, and start the development server:
```bash
cd frontend
npm install
npm run dev
```
The frontend will start on [http://localhost:5173](http://localhost:5173).

---

## 🔒 Security Best Practices
- Never commit active API keys.
- Use the provided `.gitignore` in the root directory to avoid tracking build outputs (`target/`, `node_modules/`, `dist/`) or local environment configs.

---

## 📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

# 🧠 StudyBuddy AI — Your Intelligent Learning Companion

> **Transform any study material into interactive flashcards, quizzes, mind maps, and personalized study plans — powered by Google Gemini AI.**

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss)
![Gemini](https://img.shields.io/badge/Google_Gemini-AI-purple?style=for-the-badge&logo=google)

---

## 🎯 Problem Statement

Students struggle with **effective self-study** — they spend hours reading notes but lack tools to actively test their understanding, identify weak areas, and structure their study time. Traditional study methods are passive, unstructured, and don't adapt to individual learning needs.

## 💡 Solution

**StudyBuddy AI** is an intelligent learning companion that transforms any study material (PDFs, text notes) into an interactive, personalized study experience using AI. Upload your notes and instantly get AI-powered tools to master any subject.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 📄 **Smart Upload** | Upload PDFs or paste text notes — AI extracts and understands your content instantly |
| 💬 **AI Chat Tutor** | Ask questions about your notes — get Socratic-method explanations with streaming responses |
| 🃏 **Auto Flashcards** | AI generates smart flashcards with flip animations — mark as mastered, track progress |
| ❓ **Adaptive Quizzes** | MCQ quizzes with timer, instant scoring, detailed explanations, and performance tracking |
| 🧩 **Mind Maps** | Visualize concept relationships with AI-generated hierarchical mind maps |
| 📋 **Study Plans** | Personalized study schedules based on your material, prioritized by importance |
| 📊 **Progress Dashboard** | Track your learning journey with charts, stats, and analytics |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────┐
│                   Frontend                        │
│  Next.js 16 (App Router) + TypeScript + Tailwind │
│  Zustand (State) + Framer Motion (Animations)    │
├──────────────────────────────────────────────────┤
│                   API Routes                      │
│  /api/chat          → Streaming AI Chat          │
│  /api/flashcards    → Flashcard Generation       │
│  /api/quiz          → Quiz Generation            │
│  /api/mindmap       → Mind Map Generation        │
│  /api/study-plan    → Study Plan Generation      │
│  /api/extract-text  → PDF Text Extraction        │
├──────────────────────────────────────────────────┤
│                   AI Engine                        │
│  Google Gemini 2.0 Flash (via @google/generative-ai) │
└──────────────────────────────────────────────────┘
```

---

## 🛠️ Technologies Used

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 |
| **AI Model** | Google Gemini 2.0 Flash |
| **AI SDK** | @google/generative-ai |
| **State Management** | Zustand v5 |
| **Animations** | Framer Motion v14 |
| **Charts** | Recharts |
| **PDF Parsing** | pdf-parse v2 |
| **Icons** | Lucide React |
| **File Upload** | React Dropzone |
| **Markdown** | React Markdown + remark-gfm |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm** 9+
- **Google Gemini API Key** — [Get it free here](https://aistudio.google.com/apikey)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/studybuddy-ai.git
   cd studybuddy-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

---

## 📱 How to Use

1. **Visit the Landing Page** → Click "Get Started Free"
2. **Upload Your Notes** → Drag & drop PDFs or paste text
3. **Chat with AI Tutor** → Ask questions about your material
4. **Generate Flashcards** → Study with interactive flip cards
5. **Take Quizzes** → Test your knowledge with MCQs
6. **View Mind Maps** → Visualize concept relationships
7. **Follow Study Plans** → AI-generated study schedules
8. **Track Progress** → Monitor your learning journey

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles + theme
│   ├── dashboard/
│   │   └── page.tsx            # Main dashboard
│   └── api/
│       ├── chat/route.ts       # AI chat (streaming)
│       ├── flashcards/route.ts # Flashcard generation
│       ├── quiz/route.ts       # Quiz generation
│       ├── mindmap/route.ts    # Mind map generation
│       ├── study-plan/route.ts # Study plan generation
│       └── extract-text/route.ts # PDF text extraction
├── components/
│   └── dashboard/
│       ├── Sidebar.tsx         # Navigation sidebar
│       ├── UploadZone.tsx      # File upload component
│       ├── ChatInterface.tsx   # AI chat interface
│       ├── FlashCards.tsx      # Flashcard study mode
│       ├── QuizMode.tsx        # Quiz with scoring
│       ├── MindMap.tsx         # Mind map visualization
│       ├── StudyPlan.tsx       # Study plan checklist
│       └── ProgressDashboard.tsx # Analytics dashboard
└── lib/
    ├── types.ts                # TypeScript types
    ├── store.ts                # Zustand state management
    └── gemini.ts               # Gemini AI client
```

---

## 🎨 Design Highlights

- **Dark Theme** — Professional dark UI with purple/indigo accent gradients
- **Glassmorphism** — Frosted glass card effects with backdrop blur
- **Smooth Animations** — Framer Motion scroll and interaction animations
- **Responsive** — Fully responsive design (mobile, tablet, desktop)
- **Accessible** — Keyboard navigation support in flashcards and quizzes

---

## 🏆 Hackathon Info

- **Event:** Prompt War — 24-Hour AI Hackathon
- **Theme:** AI for Education — Transform the Learning Experience
- **Organizer:** AI Geeks Chennai
- **Date:** November 20-21, 2026

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ for Prompt War Hackathon by AI Geeks Chennai**

*Think Big. Build Smart. Make an Impact.* 🚀

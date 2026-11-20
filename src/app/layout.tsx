import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyBuddy AI — Your Intelligent Learning Companion",
  description: "Transform your study materials into interactive flashcards, quizzes, mind maps, and personalized study plans powered by AI.",
  keywords: ["AI", "study", "education", "flashcards", "quiz", "mind map", "learning"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased bg-[#090A0F] text-[#ededed]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white text-sm font-medium"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}

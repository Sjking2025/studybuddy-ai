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
        {children}
      </body>
    </html>
  );
}

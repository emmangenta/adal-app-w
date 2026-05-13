import { Link } from "react-router";
import { Button } from "../ui/button";
import { Brain, Sparkles, Trophy, Zap } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            LearnAI
          </h1>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
              <Sparkles className="size-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                AI-Powered Learning Platform
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Master Anything with{" "}
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                AI-Generated
              </span>{" "}
              Study Materials
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your documents and let AI create personalized quizzes, flashcards, and
              learning paths. Level up your knowledge with gamified studying.
            </p>

            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link to="/register">
                <Button size="lg" className="gap-2">
                  <Zap className="size-5" />
                  Start Studying Free
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
              <div className="p-6 rounded-2xl bg-card border border-border hover:border-purple-500/50 transition-colors">
                <div className="size-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                  <Brain className="size-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">AI-Generated Content</h3>
                <p className="text-sm text-muted-foreground">
                  Upload PDFs or Word docs and get instant quizzes, flashcards, and study guides
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border hover:border-blue-500/50 transition-colors">
                <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                  <Trophy className="size-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Gamification</h3>
                <p className="text-sm text-muted-foreground">
                  Earn XP, unlock achievements, and collect rewards as you study
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border hover:border-cyan-500/50 transition-colors">
                <div className="size-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                  <Sparkles className="size-6 text-cyan-600" />
                </div>
                <h3 className="font-semibold mb-2">Feynman Technique</h3>
                <p className="text-sm text-muted-foreground">
                  Explain concepts in your own words and get AI feedback
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2026 LearnAI. Research prototype for educational purposes.</p>
        </div>
      </footer>
    </div>
  );
}

'use client'

import { HelpCircle } from 'lucide-react'
import type { Question } from '@/lib/quiz'

type QuizModalProps = {
  question: Question | null
  onAnswer: (index: number) => void
}

export function QuizModal({ question, onAnswer }: QuizModalProps) {
  if (!question) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border-2 border-primary/50 bg-card p-6 shadow-[0_0_60px_-15px_var(--color-primary)]">
        <div className="mb-4 flex items-center gap-2">
          <HelpCircle className="text-primary" size={20} />
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
            Pellet Quiz
          </span>
        </div>

        <h3 className="mb-5 text-balance text-lg font-bold leading-snug text-card-foreground">
          {question.q}
        </h3>

        <div className="grid gap-2">
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => onAnswer(i)}
              className="flex items-center gap-3 rounded-lg border border-border bg-secondary px-4 py-3 text-left font-mono text-sm text-secondary-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-current text-xs font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              <span>{opt}</span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-center font-mono text-[11px] text-muted-foreground">
          Correct = a hint to the exit. Wrong = random teleport!
        </p>
      </div>
    </div>
  )
}

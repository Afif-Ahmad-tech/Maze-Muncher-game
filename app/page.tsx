import { MazeGame } from '@/components/maze-game'

export default function Page() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-start gap-6 px-4 py-8 sm:py-12">
      <header className="text-center">
        <h1 className="font-mono text-3xl font-black tracking-tight text-primary sm:text-4xl text-balance">
          MAZE MUNCHER
        </h1>
        <p className="mt-1 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Eat · Quiz · Descend · Repeat
        </p>
      </header>

      <MazeGame />
    </main>
  )
}

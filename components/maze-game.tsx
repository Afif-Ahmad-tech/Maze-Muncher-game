'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  generateMaze,
  placeFood,
  solve,
  directionHint,
  type Maze,
  type Point,
} from '@/lib/maze'
import { generateQuestion, type Question } from '@/lib/quiz'
import { Hud } from '@/components/hud'
import { QuizModal } from '@/components/quiz-modal'
import { TouchControls } from '@/components/touch-controls'
import { Button } from '@/components/ui/button'

type Dir = 'up' | 'down' | 'left' | 'right'

const COLORS = {
  wall: '#f5b942',
  wallGlow: 'rgba(245,185,66,0.35)',
  bg: '#1a1d2e',
  food: '#5ad1e6',
  exit: '#6ee87f',
  player: '#f5b942',
  path: 'rgba(110,232,127,0.45)',
}

export function MazeGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [usedQuestions, setUsedQuestions] = useState<number[]>([])
  const [started, setStarted] = useState(false)
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [player, setPlayer] = useState<Point>({ x: 0, y: 0 })
  const [food, setFood] = useState<Point[]>([])
  const [eatenTotal, setEatenTotal] = useState(0)
  const [quiz, setQuiz] = useState<Question | null>(null)
  const [revealPath, setRevealPath] = useState<Point[]>([])
  const [hint, setHint] = useState<string>('')
  const [flash, setFlash] = useState<string>('')
  const dirRef = useRef<Dir>('right')

  const maze: Maze = useMemo(() => generateMaze(level), [level])
  const exit: Point = useMemo(
    () => ({ x: maze.cols - 1, y: maze.rows - 1 }),
    [maze],
  )

  // (Re)initialize a level whenever the maze changes.
  useEffect(() => {
    setPlayer({ x: 0, y: 0 })
    setFood(placeFood(maze, level, { x: 0, y: 0 }, exit))
    setEatenTotal(0)
    setRevealPath([])
    dirRef.current = 'right'
  }, [maze, level, exit])

  const showFlash = useCallback((msg: string) => {
    setFlash(msg)
    window.setTimeout(() => setFlash(''), 1600)
  }, [])

  const checkArrival = useCallback(
    (pos: Point) => {
      // Reached exit -> descend a floor.
      if (pos.x === exit.x && pos.y === exit.y) {
        setScore((s) => s + 100 + level * 10)
        setLevel((l) => l + 1)
        showFlash('LEVEL CLEARED — DESCENDING')
        return true
      }
      // Stepped onto food -> trigger a quiz.
      const onFood = food.find((f) => f.x === pos.x && f.y === pos.y)
      if (onFood) {
  setFood((prev) =>
    prev.filter((f) => !(f.x === pos.x && f.y === pos.y))
  )

  setScore((s) => s + 25)

  setEatenTotal((n) => n + 1)

  const q = generateQuestion(level)
setQuiz(q)
}
      return false
    },
    [exit, food, level, eatenTotal, showFlash],
  )

  const move = useCallback(
    (dir: Dir) => {
      if (quiz || !started) return
      dirRef.current = dir
      setPlayer((p) => {
        const cell = maze.grid[p.y][p.x]
        // walls: [top, right, bottom, left]
        let nx = p.x
        let ny = p.y
        if (dir === 'up' && !cell.walls[0]) ny -= 1
        else if (dir === 'right' && !cell.walls[1]) nx += 1
        else if (dir === 'down' && !cell.walls[2]) ny += 1
        else if (dir === 'left' && !cell.walls[3]) nx -= 1
        if (nx === p.x && ny === p.y) return p
        const next = { x: nx, y: ny }
        checkArrival(next)
        return next
      })
    },
    [maze, quiz, started, checkArrival],
  )

  // Keyboard controls.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      const map: Record<string, Dir> = {
        arrowup: 'up',
        w: 'up',
        arrowdown: 'down',
        s: 'down',
        arrowleft: 'left',
        a: 'left',
        arrowright: 'right',
        d: 'right',
      }
      if (map[k]) {
        e.preventDefault()
        move(map[k])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [move])

  const onAnswer = useCallback(
    (index: number) => {
      if (!quiz) return
      const correct = index === quiz.answer
      if (correct) {
        setScore((s) => s + 50)
        setHint(directionHint(player, exit))
        // Briefly reveal the shortest path to the exit.
        const path = solve(maze, player, exit)
        setRevealPath(path)
        window.setTimeout(() => setRevealPath([]), 3000)
        showFlash('CORRECT! +50 — path revealed')
      } else {
        // Teleport to a random cell (never the exit).
        let tx = 0
        let ty = 0
        do {
          tx = Math.floor(Math.random() * maze.cols)
          ty = Math.floor(Math.random() * maze.rows)
        } while (tx === exit.x && ty === exit.y)
        setPlayer({ x: tx, y: ty })
        setHint('')
        showFlash('WRONG! Teleported...')
      }
      setQuiz(null)
    },
    [quiz, player, exit, maze, showFlash],
  )

  // ---- Canvas rendering -------------------------------------------------
  const gameRef = useRef({ maze, player, exit, food, revealPath })
  useEffect(() => {
    gameRef.current = { maze, player, exit, food, revealPath }
  }, [maze, player, exit, food, revealPath])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let mouth = 0
    let mouthDir = 1

    const render = () => {
      const { maze: m, player: p, exit: ex, food: fd, revealPath: rp } =
        gameRef.current
      const cell = Math.floor(Math.min(560 / m.cols, 560 / m.rows))
      const w = cell * m.cols
      const h = cell * m.rows
      if (canvas.width !== w) canvas.width = w
      if (canvas.height !== h) canvas.height = h

      ctx.fillStyle = COLORS.bg
      ctx.fillRect(0, 0, w, h)

      // Revealed path tint.
      if (rp.length) {
        ctx.fillStyle = COLORS.path
        for (const pt of rp) {
          ctx.fillRect(pt.x * cell + 2, pt.y * cell + 2, cell - 4, cell - 4)
        }
      }

      // Exit door.
      ctx.fillStyle = COLORS.exit
      ctx.shadowColor = COLORS.exit
      ctx.shadowBlur = 16
      ctx.fillRect(ex.x * cell + cell * 0.2, ex.y * cell + cell * 0.2, cell * 0.6, cell * 0.6)
      ctx.shadowBlur = 0

      // Food pellets.
      ctx.fillStyle = COLORS.food
      ctx.shadowColor = COLORS.food
      ctx.shadowBlur = 10
      for (const f of fd) {
        ctx.beginPath()
        ctx.arc(f.x * cell + cell / 2, f.y * cell + cell / 2, cell * 0.16, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.shadowBlur = 0

      // Walls.
      ctx.strokeStyle = COLORS.wall
      ctx.lineWidth = Math.max(2, cell * 0.08)
      ctx.lineCap = 'round'
      ctx.shadowColor = COLORS.wallGlow
      ctx.shadowBlur = 6
      for (let y = 0; y < m.rows; y++) {
        for (let x = 0; x < m.cols; x++) {
          const c = m.grid[y][x]
          const px = x * cell
          const py = y * cell
          ctx.beginPath()
          if (c.walls[0]) {
            ctx.moveTo(px, py)
            ctx.lineTo(px + cell, py)
          }
          if (c.walls[1]) {
            ctx.moveTo(px + cell, py)
            ctx.lineTo(px + cell, py + cell)
          }
          if (c.walls[2]) {
            ctx.moveTo(px + cell, py + cell)
            ctx.lineTo(px, py + cell)
          }
          if (c.walls[3]) {
            ctx.moveTo(px, py + cell)
            ctx.lineTo(px, py)
          }
          ctx.stroke()
        }
      }
      ctx.shadowBlur = 0

      // Player ("ball man") with animated chomp.
      mouth += 0.08 * mouthDir
      if (mouth > 0.32 || mouth < 0) mouthDir *= -1
      const cx = p.x * cell + cell / 2
      const cy = p.y * cell + cell / 2
      const r = cell * 0.36
      const angles: Record<Dir, number> = {
        right: 0,
        down: Math.PI / 2,
        left: Math.PI,
        up: -Math.PI / 2,
      }
      const base = angles[dirRef.current]
      const m1 = base + mouth * Math.PI
      const m2 = base - mouth * Math.PI + Math.PI * 2
      ctx.fillStyle = COLORS.player
      ctx.shadowColor = COLORS.player
      ctx.shadowBlur = 18
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, m1, m2)
      ctx.closePath()
      ctx.fill()
      ctx.shadowBlur = 0
      // Eye.
      ctx.fillStyle = COLORS.bg
      const eyeAngle = base - Math.PI / 2
      ctx.beginPath()
      ctx.arc(
        cx + Math.cos(eyeAngle) * r * 0.4,
        cy + Math.sin(eyeAngle) * r * 0.4,
        Math.max(1.5, cell * 0.05),
        0,
        Math.PI * 2,
      )
      ctx.fill()

      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)
    return () => cancelAnimationFrame(raf)
  }, [])
  useEffect(() => {
  localStorage.setItem(
    "maze-save",
    JSON.stringify({
      level,
      score,
      usedQuestions,
    })
  )
}, [level, score, usedQuestions])

useEffect(() => {
  const save =
    localStorage.getItem("maze-save")

  if (!save) return

  const data = JSON.parse(save)

  setLevel(data.level || 1)
  setScore(data.score || 0)
  setUsedQuestions(
    data.usedQuestions || []
  )

  setStarted(true)
}, [])
  const startGame = () => {
  localStorage.removeItem("maze-save")

  setStarted(true)
  setLevel(1)
  setScore(0)
  setUsedQuestions([])
  setHint('')
}

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-5">
      <Hud level={level} score={score} foodLeft={food.length} hint={hint} />

      <div className="relative w-full">
        <div className="relative mx-auto flex aspect-square w-full max-w-[560px] items-center justify-center rounded-xl border-2 border-primary/40 bg-[#1a1d2e] p-2 shadow-[0_0_40px_-12px_var(--color-primary)]">
          <canvas
            ref={canvasRef}
            className="h-full w-full rounded-md"
            aria-label={`Maze level ${level}`}
          />

          {/* Flash banner */}
          {flash && (
            <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
              <span className="rounded-full bg-primary px-4 py-1.5 font-mono text-xs font-bold tracking-wider text-primary-foreground shadow-lg">
                {flash}
              </span>
            </div>
          )}

          {/* Start overlay */}
          {!started && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-md bg-[#1a1d2e]/95 text-center">
              <h2 className="font-mono text-2xl font-black tracking-tight text-primary text-balance">
                MAZE MUNCHER
              </h2>
              <p className="max-w-xs text-pretty px-6 text-sm text-muted-foreground">
                Eat pellets, answer the quiz, and find the exit to descend ever
                deeper. There is no bottom floor.
              </p>
              <Button onClick={startGame} size="lg" className="font-mono font-bold">
                START LEVEL 1
              </Button>
            </div>
          )}
        </div>
      </div>

      {started && <TouchControls onMove={move} disabled={!!quiz} />}

      <p className="text-center font-mono text-xs text-muted-foreground">
        Move with Arrow keys / WASD or the on-screen pad. Reach the green exit to
        level up.
      </p>

      <QuizModal question={quiz} onAnswer={onAnswer} />
    </div>
  )
}

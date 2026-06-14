import { generateMaze, placeFood, solve } from './lib/maze.ts'
const level = 1
const m = generateMaze(level)
const exit = { x: m.cols - 1, y: m.rows - 1 }
const food = placeFood(m, level, { x: 0, y: 0 }, exit)
const exitKey = exit.y * m.cols + exit.x

function toDirs(path) {
  const dirs = []
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i]
    if (b.y < a.y) dirs.push('ArrowUp')
    else if (b.y > a.y) dirs.push('ArrowDown')
    else if (b.x > a.x) dirs.push('ArrowRight')
    else dirs.push('ArrowLeft')
  }
  return dirs
}

// Pick the food whose path from start does NOT cross the exit, shortest first.
let best = null
for (const f of food) {
  const path = solve(m, { x: 0, y: 0 }, f)
  const crossesExit = path.some((p) => p.y * m.cols + p.x === exitKey)
  if (crossesExit) continue
  if (!best || path.length < best.path.length) best = { target: f, path }
}

if (!best) {
  console.log(JSON.stringify({ error: 'all food paths cross exit', food }))
} else {
  console.log(JSON.stringify({ target: best.target, dirs: toDirs(best.path) }))
}

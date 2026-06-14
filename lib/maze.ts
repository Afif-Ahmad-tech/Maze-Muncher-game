export type Cell = {
  x: number
  y: number
  // walls: top, right, bottom, left
  walls: [boolean, boolean, boolean, boolean]
  visited: boolean
}

export type Maze = {
  cols: number
  rows: number
  grid: Cell[][]
}

export type Point = { x: number; y: number }

// Mulberry32 seeded PRNG so a given level always generates the same maze.
function mulberry32(seed: number) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Maze grows slightly with the level, capped so it stays playable on screen.
export function sizeForLevel(level: number) {
  const size = 7 + Math.floor((level - 1) / 2)
  return Math.min(size, 18)
}

export function generateMaze(level: number): Maze {
  const size = sizeForLevel(level)
  const cols = size
  const rows = size
  const rand = mulberry32(level * 2654435761 + 12345)

  const grid: Cell[][] = []
  for (let y = 0; y < rows; y++) {
    const row: Cell[] = []
    for (let x = 0; x < cols; x++) {
      row.push({ x, y, walls: [true, true, true, true], visited: false })
    }
    grid.push(row)
  }

  // Recursive backtracker (iterative with stack).
  const stack: Cell[] = []
  let current = grid[0][0]
  current.visited = true
  let unvisited = cols * rows - 1

  const neighbors = (c: Cell): { cell: Cell; dir: number }[] => {
    const list: { cell: Cell; dir: number }[] = []
    if (c.y > 0 && !grid[c.y - 1][c.x].visited)
      list.push({ cell: grid[c.y - 1][c.x], dir: 0 }) // top
    if (c.x < cols - 1 && !grid[c.y][c.x + 1].visited)
      list.push({ cell: grid[c.y][c.x + 1], dir: 1 }) // right
    if (c.y < rows - 1 && !grid[c.y + 1][c.x].visited)
      list.push({ cell: grid[c.y + 1][c.x], dir: 2 }) // bottom
    if (c.x > 0 && !grid[c.y][c.x - 1].visited)
      list.push({ cell: grid[c.y][c.x - 1], dir: 3 }) // left
    return list
  }

  while (unvisited > 0) {
    const next = neighbors(current)
    if (next.length > 0) {
      const { cell, dir } = next[Math.floor(rand() * next.length)]
      // Knock down walls between current and chosen neighbor.
      current.walls[dir] = false
      cell.walls[(dir + 2) % 4] = false
      stack.push(current)
      cell.visited = true
      unvisited--
      current = cell
    } else if (stack.length > 0) {
      current = stack.pop()!
    } else {
      break
    }
  }

  return { cols, rows, grid }
}

// BFS shortest path between two cells, returns ordered list of points.
export function solve(maze: Maze, start: Point, end: Point): Point[] {
  const { cols, rows, grid } = maze
  const key = (p: Point) => p.y * cols + p.x
  const queue: Point[] = [start]
  const cameFrom = new Map<number, Point | null>()
  cameFrom.set(key(start), null)

  while (queue.length) {
    const cur = queue.shift()!
    if (cur.x === end.x && cur.y === end.y) break
    const cell = grid[cur.y][cur.x]
    const moves: Point[] = []
    if (!cell.walls[0]) moves.push({ x: cur.x, y: cur.y - 1 })
    if (!cell.walls[1]) moves.push({ x: cur.x + 1, y: cur.y })
    if (!cell.walls[2]) moves.push({ x: cur.x, y: cur.y + 1 })
    if (!cell.walls[3]) moves.push({ x: cur.x - 1, y: cur.y })
    for (const m of moves) {
      if (m.x < 0 || m.y < 0 || m.x >= cols || m.y >= rows) continue
      if (!cameFrom.has(key(m))) {
        cameFrom.set(key(m), cur)
        queue.push(m)
      }
    }
  }

  // Reconstruct path.
  const path: Point[] = []
  let cur: Point | null | undefined = end
  while (cur) {
    path.push(cur)
    cur = cameFrom.get(key(cur)) ?? null
  }
  return path.reverse()
}

// Place food on cells that are not the start, exit, or already used.
export function placeFood(
  maze: Maze,
  level: number,
  start: Point,
  exit: Point,
): Point[] {
  const rand = mulberry32(level * 40503 + 7)
  const count = Math.min(3 + Math.floor(level / 2), 8)
  const taken = new Set<number>([
    start.y * maze.cols + start.x,
    exit.y * maze.cols + exit.x,
  ])
  const food: Point[] = []
  let attempts = 0
  while (food.length < count && attempts < 500) {
    attempts++
    const x = Math.floor(rand() * maze.cols)
    const y = Math.floor(rand() * maze.rows)
    const k = y * maze.cols + x
    if (taken.has(k)) continue
    taken.add(k)
    food.push({ x, y })
  }
  return food
}

// A coarse compass hint pointing from the player toward the exit.
export function directionHint(from: Point, to: Point): string {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const parts: string[] = []
  if (dy < 0) parts.push('North')
  if (dy > 0) parts.push('South')
  if (dx > 0) parts.push('East')
  if (dx < 0) parts.push('West')
  if (parts.length === 0) return 'You are right on top of the exit!'
  return `The exit lies to the ${parts.join('-')}.`
}

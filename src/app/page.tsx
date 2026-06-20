"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const TICK_MS = 450

type Board = number[][]

type Piece = {
  shape: number[][]
  x: number
  y: number
  color: number
}

type Tetromino = {
  shape: number[][]
  color: number
}

const TETROMINOES: Tetromino[] = [
  { shape: [[1, 1, 1, 1]], color: 1 },
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: 2,
  },
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: 3,
  },
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: 4,
  },
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: 5,
  },
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: 6,
  },
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: 7,
  },
]

const COLOR_BY_VALUE: Record<number, string> = {
  0: "#1f2937",
  1: "#38bdf8",
  2: "#60a5fa",
  3: "#f59e0b",
  4: "#facc15",
  5: "#34d399",
  6: "#a78bfa",
  7: "#f472b6",
}

function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0))
}

function randomPiece(): Piece {
  const tetromino = TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)]
  const shape = tetromino.shape.map((row) => [...row])
  return {
    shape,
    x: Math.floor((BOARD_WIDTH - shape[0].length) / 2),
    y: 0,
    color: tetromino.color,
  }
}

function collides(board: Board, piece: Piece, dx = 0, dy = 0, testShape?: number[][]): boolean {
  const shape = testShape ?? piece.shape

  for (let py = 0; py < shape.length; py += 1) {
    for (let px = 0; px < shape[py].length; px += 1) {
      if (!shape[py][px]) {
        continue
      }
      const x = piece.x + px + dx
      const y = piece.y + py + dy

      if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT) {
        return true
      }
      if (y >= 0 && board[y][x] !== 0) {
        return true
      }
    }
  }

  return false
}

function mergePiece(board: Board, piece: Piece): Board {
  const merged = board.map((row) => [...row])
  piece.shape.forEach((row, py) => {
    row.forEach((cell, px) => {
      if (!cell) {
        return
      }
      const x = piece.x + px
      const y = piece.y + py
      if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
        merged[y][x] = piece.color
      }
    })
  })
  return merged
}

function clearLines(board: Board): { nextBoard: Board; linesCleared: number } {
  const keptRows = board.filter((row) => row.some((cell) => cell === 0))
  const linesCleared = BOARD_HEIGHT - keptRows.length
  const freshRows = Array.from({ length: linesCleared }, () => Array(BOARD_WIDTH).fill(0))
  return {
    nextBoard: [...freshRows, ...keptRows],
    linesCleared,
  }
}

function rotateClockwise(shape: number[][]): number[][] {
  return shape[0].map((_, x) => shape.map((row) => row[x]).reverse())
}

function scoreForLines(lines: number): number {
  if (lines === 1) return 100
  if (lines === 2) return 300
  if (lines === 3) return 500
  if (lines >= 4) return 800
  return 0
}

export default function Home() {
  const [board, setBoard] = useState<Board>(createEmptyBoard)
  const [piece, setPiece] = useState<Piece | null>(null)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [isRunning, setIsRunning] = useState(true)
  const [isGameOver, setIsGameOver] = useState(false)

  useEffect(() => {
    // Create the first random piece only on the client to avoid SSR hydration mismatch.
    setPiece(randomPiece())
  }, [])

  const restart = useCallback(() => {
    const freshBoard = createEmptyBoard()
    const freshPiece = randomPiece()
    setBoard(freshBoard)
    setPiece(freshPiece)
    setScore(0)
    setLines(0)
    setIsGameOver(false)
    setIsRunning(true)
  }, [])

  const spawnNextPiece = useCallback(
    (activeBoard: Board) => {
      const nextPiece = randomPiece()
      if (collides(activeBoard, nextPiece)) {
        setIsGameOver(true)
        setIsRunning(false)
        return
      }
      setPiece(nextPiece)
    },
    [setPiece],
  )

  const lockAndContinue = useCallback((pieceToLock: Piece) => {
    setBoard((prevBoard) => {
      const merged = mergePiece(prevBoard, pieceToLock)
      const { nextBoard, linesCleared } = clearLines(merged)
      if (linesCleared > 0) {
        setLines((prev) => prev + linesCleared)
        setScore((prev) => prev + scoreForLines(linesCleared))
      }
      spawnNextPiece(nextBoard)
      return nextBoard
    })
  }, [spawnNextPiece])

  const moveHorizontally = useCallback(
    (dx: number) => {
      if (!isRunning || isGameOver || !piece) return
      if (!collides(board, piece, dx, 0)) {
        setPiece({ ...piece, x: piece.x + dx })
      }
    },
    [board, isGameOver, isRunning, piece],
  )

  const dropOneRow = useCallback(() => {
    if (!isRunning || isGameOver || !piece) return
    if (!collides(board, piece, 0, 1)) {
      setPiece({ ...piece, y: piece.y + 1 })
      return
    }
    lockAndContinue(piece)
  }, [board, isGameOver, isRunning, lockAndContinue, piece])

  const rotate = useCallback(() => {
    if (!isRunning || isGameOver || !piece) return
    const rotated = rotateClockwise(piece.shape)
    if (!collides(board, piece, 0, 0, rotated)) {
      setPiece({ ...piece, shape: rotated })
    }
  }, [board, isGameOver, isRunning, piece])

  const hardDrop = useCallback(() => {
    if (!isRunning || isGameOver || !piece) return
    let nextY = piece.y
    while (!collides(board, piece, 0, nextY - piece.y + 1)) {
      nextY += 1
    }
    const droppedPiece: Piece = { ...piece, y: nextY }
    lockAndContinue(droppedPiece)
  }, [board, isGameOver, isRunning, lockAndContinue, piece])

  useEffect(() => {
    if (!isRunning || isGameOver || !piece) return
    const interval = setInterval(() => {
      dropOneRow()
    }, TICK_MS)
    return () => clearInterval(interval)
  }, [dropOneRow, isGameOver, isRunning, piece])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        moveHorizontally(-1)
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        moveHorizontally(1)
      } else if (event.key === "ArrowDown") {
        event.preventDefault()
        dropOneRow()
      } else if (event.key === "ArrowUp") {
        event.preventDefault()
        rotate()
      } else if (event.key === " " || event.code === "Space") {
        event.preventDefault()
        hardDrop()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [dropOneRow, hardDrop, moveHorizontally, rotate])

  const boardWithPiece = useMemo(() => {
    const boardCopy = board.map((row) => [...row])
    if (!piece) {
      return boardCopy
    }
    piece.shape.forEach((row, py) => {
      row.forEach((cell, px) => {
        if (!cell) return
        const x = piece.x + px
        const y = piece.y + py
        if (x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT) {
          boardCopy[y][x] = piece.color
        }
      })
    })
    return boardCopy
  }, [board, piece])

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <main className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 md:flex-row md:items-start md:justify-center">
        <section className="w-full max-w-[320px] rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-2xl">
          <h1 className="mb-3 text-center text-2xl font-bold tracking-wide">Simple Tetris</h1>
          <div
            aria-label="tetris-board"
            className="grid grid-cols-10 gap-[2px] rounded-md bg-slate-800 p-[2px]"
          >
            {boardWithPiece.flat().map((cell, index) => (
              <div
                key={index}
                className="h-6 w-6 rounded-sm border border-slate-900/60"
                style={{ backgroundColor: COLOR_BY_VALUE[cell] }}
              />
            ))}
          </div>
        </section>

        <aside className="w-full max-w-sm space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-xl">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md bg-slate-800 p-3">
              <p className="text-sm text-slate-300">Score</p>
              <p className="text-xl font-semibold">{score}</p>
            </div>
            <div className="rounded-md bg-slate-800 p-3">
              <p className="text-sm text-slate-300">Lines</p>
              <p className="text-xl font-semibold">{lines}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsRunning((prev) => !prev)}
              disabled={isGameOver}
              className="rounded-md bg-cyan-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRunning ? "Pause" : "Resume"}
            </button>
            <button
              type="button"
              onClick={restart}
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
            >
              Restart
            </button>
          </div>

          {isGameOver ? (
            <p className="rounded-md bg-rose-950 px-3 py-2 text-rose-300">Game Over</p>
          ) : null}

          <div className="space-y-2 text-sm text-slate-300">
            <p>Controls:</p>
            <p>Left/Right: Move</p>
            <p>Up: Rotate</p>
            <p>Down: Soft drop</p>
            <p>Space: Hard drop</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm md:hidden">
            <button type="button" onClick={() => moveHorizontally(-1)} className="rounded bg-slate-700 p-2">
              Left
            </button>
            <button type="button" onClick={rotate} className="rounded bg-slate-700 p-2">
              Rotate
            </button>
            <button type="button" onClick={() => moveHorizontally(1)} className="rounded bg-slate-700 p-2">
              Right
            </button>
            <button type="button" onClick={dropOneRow} className="col-span-2 rounded bg-slate-700 p-2">
              Down
            </button>
            <button type="button" onClick={hardDrop} className="rounded bg-slate-700 p-2">
              Drop
            </button>
          </div>
        </aside>
      </main>
    </div>
  )
}

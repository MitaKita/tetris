import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { TICK_MS } from "./constants"
import {
  boardWithActivePiece,
  clearLines,
  collides,
  createEmptyBoard,
  getHardDropY,
  mergePiece,
  randomPiece,
  rotateClockwise,
} from "./logic"
import type { Board, Piece } from "./types"
import { useTetrisScoring } from "./useTetrisScoring"

export type TetrisControls = {
  moveHorizontally: (dx: number) => void
  dropOneRow: () => void
  rotate: () => void
  hardDrop: () => void
  togglePause: () => void
  restart: () => void
}

export function useTetrisEngine() {
  const [board, setBoard] = useState<Board>(createEmptyBoard)
  const [piece, setPiece] = useState<Piece | null>(null)
  const [nextPiece, setNextPiece] = useState<Piece | null>(null)
  const nextPieceRef = useRef<Piece | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  const scoring = useTetrisScoring()

  const setQueuedPiece = useCallback((queuedPiece: Piece | null) => {
    nextPieceRef.current = queuedPiece
    setNextPiece(queuedPiece)
  }, [])

  const initializePieces = useCallback(() => {
    const firstPiece = randomPiece()
    const queuedPiece = randomPiece()
    setPiece(firstPiece)
    setQueuedPiece(queuedPiece)
  }, [setQueuedPiece])

  useEffect(() => {
    // Create the first random piece only on the client to avoid SSR hydration mismatch.
    initializePieces()
  }, [initializePieces])

  const restart = useCallback(() => {
    setBoard(createEmptyBoard())
    initializePieces()
    scoring.reset()
    setHasStarted(true)
    setIsGameOver(false)
    setIsRunning(true)
  }, [initializePieces, scoring])

  const spawnNextPiece = useCallback(
    (activeBoard: Board) => {
      const pieceToSpawn = nextPieceRef.current ?? randomPiece()
      if (collides(activeBoard, pieceToSpawn)) {
        scoring.finalizeRun()
        setPiece(null)
        setIsGameOver(true)
        setIsRunning(false)
        return
      }
      setPiece(pieceToSpawn)
      setQueuedPiece(randomPiece())
    },
    [scoring, setQueuedPiece],
  )

  const lockAndContinue = useCallback(
    (pieceToLock: Piece) => {
      const merged = mergePiece(board, pieceToLock)
      const { nextBoard, linesCleared } = clearLines(merged)
      setBoard(nextBoard)
      scoring.addLinesAndScore(linesCleared)
      spawnNextPiece(nextBoard)
    },
    [board, spawnNextPiece, scoring],
  )

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
    const nextY = getHardDropY(board, piece)
    lockAndContinue({ ...piece, y: nextY })
  }, [board, isGameOver, isRunning, lockAndContinue, piece])

  const togglePause = useCallback(() => {
    setIsRunning((prev) => {
      const next = !prev
      if (next) {
        setHasStarted(true)
      }
      return next
    })
  }, [])

  useEffect(() => {
    if (!isRunning || isGameOver || !piece) return
    const interval = setInterval(() => {
      dropOneRow()
    }, TICK_MS)
    return () => clearInterval(interval)
  }, [dropOneRow, isGameOver, isRunning, piece])

  const boardWithPiece = useMemo(
    () => boardWithActivePiece(board, piece),
    [board, piece],
  )

  const ghostCellIndices = useMemo(() => {
    if (!piece) {
      return [] as number[]
    }
    const targetY = getHardDropY(board, piece)
    const ghostCells: number[] = []
    piece.shape.forEach((row, py) => {
      row.forEach((cell, px) => {
        if (!cell) {
          return
        }
        const x = piece.x + px
        const y = targetY + py
        if (x >= 0 && x < board[0].length && y >= 0 && y < board.length) {
          ghostCells.push(y * board[0].length + x)
        }
      })
    })
    return ghostCells
  }, [board, piece])

  const controls = useMemo<TetrisControls>(
    () => ({
      moveHorizontally,
      dropOneRow,
      rotate,
      hardDrop,
      togglePause,
      restart,
    }),
    [dropOneRow, hardDrop, moveHorizontally, restart, rotate, togglePause],
  )

  return {
    boardWithPiece,
    ghostCellIndices,
    nextPiece,
    score: scoring.score,
    lines: scoring.lines,
    highScore: scoring.highScore,
    hasStarted,
    isRunning,
    isGameOver,
    controls,
  }
}

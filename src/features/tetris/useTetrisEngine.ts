import { useCallback, useEffect, useMemo, useState } from "react"
import { TICK_MS } from "./constants"
import {
  boardWithActivePiece,
  clearLines,
  collides,
  createEmptyBoard,
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
  const [isRunning, setIsRunning] = useState(true)
  const [isGameOver, setIsGameOver] = useState(false)
  const scoring = useTetrisScoring()

  useEffect(() => {
    // Create the first random piece only on the client to avoid SSR hydration mismatch.
    setPiece(randomPiece())
  }, [])

  const restart = useCallback(() => {
    setBoard(createEmptyBoard())
    setPiece(randomPiece())
    scoring.reset()
    setIsGameOver(false)
    setIsRunning(true)
  }, [scoring])

  const spawnNextPiece = useCallback((activeBoard: Board) => {
    const nextPiece = randomPiece()
    if (collides(activeBoard, nextPiece)) {
      setIsGameOver(true)
      setIsRunning(false)
      return
    }
    setPiece(nextPiece)
  }, [])

  const lockAndContinue = useCallback(
    (pieceToLock: Piece) => {
      setBoard((prevBoard) => {
        const merged = mergePiece(prevBoard, pieceToLock)
        const { nextBoard, linesCleared } = clearLines(merged)
        scoring.addLinesAndScore(linesCleared)
        spawnNextPiece(nextBoard)
        return nextBoard
      })
    },
    [spawnNextPiece, scoring],
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
    let nextY = piece.y
    while (!collides(board, piece, 0, nextY - piece.y + 1)) {
      nextY += 1
    }
    lockAndContinue({ ...piece, y: nextY })
  }, [board, isGameOver, isRunning, lockAndContinue, piece])

  const togglePause = useCallback(() => {
    setIsRunning((prev) => !prev)
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
    score: scoring.score,
    lines: scoring.lines,
    isRunning,
    isGameOver,
    controls,
  }
}

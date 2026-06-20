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
  scoreForLines,
} from "./logic"
import type { Board, Piece } from "./types"

export function useTetrisGame() {
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
    setBoard(createEmptyBoard())
    setPiece(randomPiece())
    setScore(0)
    setLines(0)
    setIsGameOver(false)
    setIsRunning(true)
  }, [])

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
        if (linesCleared > 0) {
          setLines((prev) => prev + linesCleared)
          setScore((prev) => prev + scoreForLines(linesCleared))
        }
        spawnNextPiece(nextBoard)
        return nextBoard
      })
    },
    [spawnNextPiece],
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

  const boardWithPiece = useMemo(
    () => boardWithActivePiece(board, piece),
    [board, piece],
  )

  return {
    boardWithPiece,
    score,
    lines,
    isRunning,
    isGameOver,
    controls: {
      moveHorizontally,
      dropOneRow,
      rotate,
      hardDrop,
      togglePause,
      restart,
    },
  }
}

import { BOARD_HEIGHT, BOARD_WIDTH, TETROMINOES } from "./constants"
import type { Board, Piece } from "./types"

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0))
}

export function randomPiece(): Piece {
  const tetromino = TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)]
  const shape = tetromino.shape.map((row) => [...row])
  return {
    shape,
    x: Math.floor((BOARD_WIDTH - shape[0].length) / 2),
    y: 0,
    color: tetromino.color,
  }
}

export function collides(
  board: Board,
  piece: Piece,
  dx = 0,
  dy = 0,
  testShape?: number[][],
): boolean {
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

export function mergePiece(board: Board, piece: Piece): Board {
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

export function clearLines(board: Board): {
  nextBoard: Board
  linesCleared: number
} {
  const keptRows = board.filter((row) => row.some((cell) => cell === 0))
  const linesCleared = BOARD_HEIGHT - keptRows.length
  const freshRows = Array.from({ length: linesCleared }, () =>
    Array(BOARD_WIDTH).fill(0),
  )
  return {
    nextBoard: [...freshRows, ...keptRows],
    linesCleared,
  }
}

export function rotateClockwise(shape: number[][]): number[][] {
  return shape[0].map((_, x) => shape.map((row) => row[x]).reverse())
}

export function scoreForLines(lines: number): number {
  if (lines === 1) return 100
  if (lines === 2) return 300
  if (lines === 3) return 500
  if (lines >= 4) return 800
  return 0
}

export function boardWithActivePiece(board: Board, piece: Piece | null): Board {
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
}

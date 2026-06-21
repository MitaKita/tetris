import { describe, it, expect, vi } from "vitest"
import {
  createEmptyBoard,
  randomPiece,
  collides,
  mergePiece,
  clearLines,
  rotateClockwise,
  scoreForLines,
  boardWithActivePiece,
} from "./logic"
import { BOARD_WIDTH, BOARD_HEIGHT, TETROMINOES } from "./constants"
import type { Board, Piece } from "./types"

describe("Tetris Logic", () => {
  describe("createEmptyBoard", () => {
    it("creates a board with correct dimensions", () => {
      const board = createEmptyBoard()
      expect(board).toHaveLength(BOARD_HEIGHT)
      expect(board[0]).toHaveLength(BOARD_WIDTH)
    })

    it("fills the board with zeros", () => {
      const board = createEmptyBoard()
      board.forEach((row) => {
        row.forEach((cell) => {
          expect(cell).toBe(0)
        })
      })
    })

    it("creates independent rows", () => {
      const board = createEmptyBoard()
      board[0][0] = 1
      expect(board[1][0]).toBe(0)
    })
  })

  describe("randomPiece", () => {
    it("creates a piece with valid properties", () => {
      const piece = randomPiece()
      expect(piece).toHaveProperty("shape")
      expect(piece).toHaveProperty("x")
      expect(piece).toHaveProperty("y")
      expect(piece).toHaveProperty("color")
    })

    it("starts at y position 0", () => {
      const piece = randomPiece()
      expect(piece.y).toBe(0)
    })

    it("positions piece centered horizontally", () => {
      const piece = randomPiece()
      const pieceWidth = piece.shape[0].length
      const expectedX = Math.floor((BOARD_WIDTH - pieceWidth) / 2)
      expect(piece.x).toBe(expectedX)
    })

    it("uses a tetromino from the tetrominoes array", () => {
      const piece = randomPiece()
      const validTetromino = TETROMINOES.some(
        (t) =>
          JSON.stringify(t.shape) === JSON.stringify(piece.shape) &&
          t.color === piece.color,
      )
      expect(validTetromino).toBe(true)
    })

    it("creates different pieces over multiple calls", () => {
      const pieces = Array.from({ length: 10 }, () => randomPiece())
      const uniqueShapes = new Set(pieces.map((p) => JSON.stringify(p.shape)))
      expect(uniqueShapes.size).toBeGreaterThan(1)
    })
  })

  describe("collides", () => {
    it("returns false for piece in empty space", () => {
      const board = createEmptyBoard()
      const piece: Piece = {
        shape: [[1]],
        x: 5,
        y: 5,
        color: 1,
      }
      expect(collides(board, piece)).toBe(false)
    })

    it("returns true when piece hits left wall", () => {
      const board = createEmptyBoard()
      const piece: Piece = {
        shape: [[1, 1, 1, 1]],
        x: -1,
        y: 0,
        color: 1,
      }
      expect(collides(board, piece)).toBe(true)
    })

    it("returns true when piece hits right wall", () => {
      const board = createEmptyBoard()
      const piece: Piece = {
        shape: [[1, 1, 1, 1]],
        x: BOARD_WIDTH - 2,
        y: 0,
        color: 1,
      }
      expect(collides(board, piece)).toBe(true)
    })

    it("returns true when piece hits floor", () => {
      const board = createEmptyBoard()
      const piece: Piece = {
        shape: [[1]],
        x: 5,
        y: BOARD_HEIGHT,
        color: 1,
      }
      expect(collides(board, piece)).toBe(true)
    })

    it("returns true when piece collides with board cell", () => {
      const board = createEmptyBoard()
      board[5][5] = 1
      const piece: Piece = {
        shape: [[1]],
        x: 5,
        y: 5,
        color: 2,
      }
      expect(collides(board, piece)).toBe(true)
    })

    it("handles offset collisions", () => {
      const board = createEmptyBoard()
      board[6][5] = 1
      const piece: Piece = {
        shape: [[1]],
        x: 5,
        y: 5,
        color: 2,
      }
      expect(collides(board, piece, 0, 1)).toBe(true)
    })

    it("handles horizontal offset collisions", () => {
      const board = createEmptyBoard()
      board[5][6] = 1
      const piece: Piece = {
        shape: [[1]],
        x: 5,
        y: 5,
        color: 2,
      }
      expect(collides(board, piece, 1, 0)).toBe(true)
    })

    it("accepts custom test shape", () => {
      const board = createEmptyBoard()
      const piece: Piece = {
        shape: [[1]],
        x: 5,
        y: 5,
        color: 1,
      }
      const testShape = [
        [0, 1],
        [1, 1],
      ]
      expect(collides(board, piece, 0, 0, testShape)).toBe(false)
    })

    it("ignores empty cells in shape", () => {
      const board = createEmptyBoard()
      const piece: Piece = {
        shape: [
          [1, 0],
          [0, 1],
        ],
        x: 5,
        y: 5,
        color: 1,
      }
      expect(collides(board, piece)).toBe(false)
    })
  })

  describe("mergePiece", () => {
    it("places piece on empty board", () => {
      const board = createEmptyBoard()
      const piece: Piece = {
        shape: [[1]],
        x: 5,
        y: 5,
        color: 2,
      }
      const merged = mergePiece(board, piece)
      expect(merged[5][5]).toBe(2)
    })

    it("does not modify the original board", () => {
      const board = createEmptyBoard()
      const piece: Piece = {
        shape: [[1]],
        x: 5,
        y: 5,
        color: 2,
      }
      mergePiece(board, piece)
      expect(board[5][5]).toBe(0)
    })

    it("merges multi-cell pieces correctly", () => {
      const board = createEmptyBoard()
      const piece: Piece = {
        shape: [
          [1, 1],
          [1, 1],
        ],
        x: 5,
        y: 5,
        color: 3,
      }
      const merged = mergePiece(board, piece)
      expect(merged[5][5]).toBe(3)
      expect(merged[5][6]).toBe(3)
      expect(merged[6][5]).toBe(3)
      expect(merged[6][6]).toBe(3)
    })

    it("ignores empty cells in shape", () => {
      const board = createEmptyBoard()
      const piece: Piece = {
        shape: [
          [1, 0],
          [0, 1],
        ],
        x: 5,
        y: 5,
        color: 4,
      }
      const merged = mergePiece(board, piece)
      expect(merged[5][5]).toBe(4)
      expect(merged[5][6]).toBe(0)
      expect(merged[6][5]).toBe(0)
      expect(merged[6][6]).toBe(4)
    })

    it("preserves existing board cells", () => {
      const board = createEmptyBoard()
      board[5][4] = 1
      const piece: Piece = {
        shape: [[1]],
        x: 5,
        y: 5,
        color: 2,
      }
      const merged = mergePiece(board, piece)
      expect(merged[5][4]).toBe(1)
      expect(merged[5][5]).toBe(2)
    })
  })

  describe("clearLines", () => {
    it("returns empty board with 0 lines cleared when no full rows", () => {
      const board = createEmptyBoard()
      const { nextBoard, linesCleared } = clearLines(board)
      expect(linesCleared).toBe(0)
      expect(nextBoard).toEqual(board)
    })

    it("clears a single full row", () => {
      const board = createEmptyBoard()
      board[19] = Array(BOARD_WIDTH).fill(1) // full row at bottom
      const { nextBoard, linesCleared } = clearLines(board)
      expect(linesCleared).toBe(1)
      // One empty row added at top, full row removed
      expect(nextBoard[0]).toEqual(Array(BOARD_WIDTH).fill(0))
    })

    it("clears multiple consecutive full rows", () => {
      const board = createEmptyBoard()
      board[9] = Array(BOARD_WIDTH).fill(1)
      board[10] = Array(BOARD_WIDTH).fill(2)
      board[11] = Array(BOARD_WIDTH).fill(3)
      const { nextBoard, linesCleared } = clearLines(board)
      expect(linesCleared).toBe(3)
      // Three full rows removed, three empty rows added to top
      expect(nextBoard[0]).toEqual(Array(BOARD_WIDTH).fill(0))
      expect(nextBoard[1]).toEqual(Array(BOARD_WIDTH).fill(0))
      expect(nextBoard[2]).toEqual(Array(BOARD_WIDTH).fill(0))
    })

    it("clears full rows with partial rows above", () => {
      const board = createEmptyBoard()
      const partial = Array(BOARD_WIDTH).fill(1)
      partial[5] = 0 // one empty
      board[18] = partial
      board[19] = Array(BOARD_WIDTH).fill(2) // full row
      const { nextBoard, linesCleared } = clearLines(board)
      expect(linesCleared).toBe(1)
      expect(nextBoard[0]).toEqual(Array(BOARD_WIDTH).fill(0))
    })

    it("drops rows above cleared full row", () => {
      const board = createEmptyBoard()
      const partialRow = Array(BOARD_WIDTH).fill(1)
      partialRow[9] = 0 // one empty cell
      board[18] = partialRow
      board[19] = Array(BOARD_WIDTH).fill(2) // full row at bottom
      const { nextBoard, linesCleared } = clearLines(board)
      expect(linesCleared).toBe(1)
      // Row 19 full (removed), row 18 kept (has empty)
      expect(nextBoard[BOARD_HEIGHT - 1][9]).toBe(0)
    })
    it("preserves partial rows when clearing full rows", () => {
      const board = createEmptyBoard()
      const partialRow = Array(BOARD_WIDTH).fill(1)
      partialRow[0] = 0 // one empty cell
      board[18] = partialRow
      board[19] = Array(BOARD_WIDTH).fill(2) // full row at bottom
      const { nextBoard, linesCleared } = clearLines(board)
      expect(linesCleared).toBe(1)
      // Row 19 full (removed), row 18 kept (has empty), one empty row added
      expect(nextBoard[0]).toEqual(Array(BOARD_WIDTH).fill(0))
      expect(nextBoard[1][0]).toBe(0) // partial row moved down
    })
    it("keeps rows with at least one empty cell", () => {
      const board = createEmptyBoard()
      const partialRow = Array(BOARD_WIDTH).fill(1)
      partialRow[5] = 0 // one empty cell
      board[10] = partialRow
      board[11] = Array(BOARD_WIDTH).fill(1) // full row
      const { nextBoard, linesCleared } = clearLines(board)
      expect(linesCleared).toBe(1)
      // Partial row should be kept and dropped to bottom
      expect(nextBoard[BOARD_HEIGHT - 1][5]).toBe(0)
    })
    it("adds empty rows at top for cleared lines", () => {
      const board = createEmptyBoard()
      board[BOARD_HEIGHT - 1] = Array(BOARD_WIDTH).fill(1)
      const { nextBoard, linesCleared } = clearLines(board)
      expect(linesCleared).toBe(1)
      expect(nextBoard[0]).toEqual(Array(BOARD_WIDTH).fill(0))
    })

    it("preserves board dimensions", () => {
      const board = createEmptyBoard()
      board[10] = Array(BOARD_WIDTH).fill(1)
      const { nextBoard } = clearLines(board)
      expect(nextBoard).toHaveLength(BOARD_HEIGHT)
      expect(nextBoard[0]).toHaveLength(BOARD_WIDTH)
    })
  })

  describe("rotateClockwise", () => {
    it("rotates a 2x2 square", () => {
      const shape = [
        [1, 2],
        [3, 4],
      ]
      const rotated = rotateClockwise(shape)
      expect(rotated).toEqual([
        [3, 1],
        [4, 2],
      ])
    })

    it("rotates a 1x4 line to 4x1", () => {
      const shape = [[1, 2, 3, 4]]
      const rotated = rotateClockwise(shape)
      expect(rotated).toEqual([[1], [2], [3], [4]])
    })

    it("rotates a 4x1 line to 1x4", () => {
      const shape = [[1], [2], [3], [4]]
      const rotated = rotateClockwise(shape)
      expect(rotated).toEqual([[4, 3, 2, 1]])
    })

    it("rotates an L-piece correctly", () => {
      const shape = [
        [0, 1],
        [1, 1],
        [1, 0],
      ]
      const rotated = rotateClockwise(shape)
      expect(rotated).toEqual([
        [1, 1, 0],
        [0, 1, 1],
      ])
    })

    it("handles multiple rotations", () => {
      const shape = [
        [1, 0],
        [0, 1],
      ]
      const rotated1 = rotateClockwise(shape)
      const rotated2 = rotateClockwise(rotated1)
      const rotated3 = rotateClockwise(rotated2)
      const rotated4 = rotateClockwise(rotated3)
      expect(rotated4).toEqual(shape)
    })
  })

  describe("scoreForLines", () => {
    it("returns 100 for 1 line", () => {
      expect(scoreForLines(1)).toBe(100)
    })

    it("returns 300 for 2 lines", () => {
      expect(scoreForLines(2)).toBe(300)
    })

    it("returns 500 for 3 lines", () => {
      expect(scoreForLines(3)).toBe(500)
    })

    it("returns 800 for 4 lines", () => {
      expect(scoreForLines(4)).toBe(800)
    })

    it("returns 800 for 5+ lines", () => {
      expect(scoreForLines(5)).toBe(800)
      expect(scoreForLines(10)).toBe(800)
    })

    it("returns 0 for 0 lines", () => {
      expect(scoreForLines(0)).toBe(0)
    })

    it("returns 0 for negative lines", () => {
      expect(scoreForLines(-1)).toBe(0)
    })
  })

  describe("boardWithActivePiece", () => {
    it("returns board copy when piece is null", () => {
      const board = createEmptyBoard()
      board[5][5] = 1
      const result = boardWithActivePiece(board, null)
      expect(result[5][5]).toBe(1)
      expect(result).not.toBe(board)
    })

    it("overlays piece on board", () => {
      const board = createEmptyBoard()
      const piece: Piece = {
        shape: [[1]],
        x: 5,
        y: 5,
        color: 2,
      }
      const result = boardWithActivePiece(board, piece)
      expect(result[5][5]).toBe(2)
    })

    it("does not modify original board", () => {
      const board = createEmptyBoard()
      const piece: Piece = {
        shape: [[1]],
        x: 5,
        y: 5,
        color: 2,
      }
      boardWithActivePiece(board, piece)
      expect(board[5][5]).toBe(0)
    })

    it("overlays multi-cell piece", () => {
      const board = createEmptyBoard()
      const piece: Piece = {
        shape: [
          [1, 1],
          [1, 1],
        ],
        x: 5,
        y: 5,
        color: 3,
      }
      const result = boardWithActivePiece(board, piece)
      expect(result[5][5]).toBe(3)
      expect(result[5][6]).toBe(3)
      expect(result[6][5]).toBe(3)
      expect(result[6][6]).toBe(3)
    })

    it("ignores empty cells in piece shape", () => {
      const board = createEmptyBoard()
      const piece: Piece = {
        shape: [
          [1, 0],
          [0, 1],
        ],
        x: 5,
        y: 5,
        color: 4,
      }
      const result = boardWithActivePiece(board, piece)
      expect(result[5][5]).toBe(4)
      expect(result[5][6]).toBe(0)
      expect(result[6][5]).toBe(0)
      expect(result[6][6]).toBe(4)
    })

    it("does not overlay piece outside board bounds", () => {
      const board = createEmptyBoard()
      const piece: Piece = {
        shape: [
          [1, 1],
          [1, 1],
        ],
        x: BOARD_WIDTH - 1,
        y: BOARD_HEIGHT - 1,
        color: 5,
      }
      const result = boardWithActivePiece(board, piece)
      expect(result[BOARD_HEIGHT - 1][BOARD_WIDTH - 1]).toBe(5)
      expect(result[BOARD_HEIGHT - 1][BOARD_WIDTH]).toBeUndefined()
    })

    it("preserves existing board cells", () => {
      const board = createEmptyBoard()
      board[5][4] = 1
      const piece: Piece = {
        shape: [[1]],
        x: 5,
        y: 5,
        color: 2,
      }
      const result = boardWithActivePiece(board, piece)
      expect(result[5][4]).toBe(1)
      expect(result[5][5]).toBe(2)
    })
  })
})

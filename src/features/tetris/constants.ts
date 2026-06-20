import type { Tetromino } from "./types"

export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 20
export const TICK_MS = 450

export const TETROMINOES: Tetromino[] = [
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

export const COLOR_BY_VALUE: Record<number, string> = {
  0: "#1f2937",
  1: "#38bdf8",
  2: "#60a5fa",
  3: "#f59e0b",
  4: "#facc15",
  5: "#34d399",
  6: "#a78bfa",
  7: "#f472b6",
}

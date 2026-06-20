export type Board = number[][]

export type Piece = {
  shape: number[][]
  x: number
  y: number
  color: number
}

export type Tetromino = {
  shape: number[][]
  color: number
}

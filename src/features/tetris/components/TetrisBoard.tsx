import { COLOR_BY_VALUE } from "../constants"
import type { Board } from "../types"

type TetrisBoardProps = {
  board: Board
}

export function TetrisBoard({ board }: TetrisBoardProps) {
  return (
    <section className="w-full max-w-[320px] rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-2xl">
      <h1 className="mb-3 text-center text-2xl font-bold tracking-wide">Simple Tetris</h1>
      <div aria-label="tetris-board" className="grid grid-cols-10 gap-[2px] rounded-md bg-slate-800 p-[2px]">
        {board.flat().map((cell, index) => (
          <div
            key={index}
            className="h-6 w-6 rounded-sm border border-slate-900/60"
            style={{ backgroundColor: COLOR_BY_VALUE[cell] }}
          />
        ))}
      </div>
    </section>
  )
}

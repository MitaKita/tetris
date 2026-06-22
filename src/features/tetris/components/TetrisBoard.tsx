import { COLOR_BY_VALUE } from "../constants"
import type { Board } from "../types"

type TetrisBoardProps = {
  board: Board
  ghostCellIndices: number[]
  hasStarted: boolean
  onStart: () => void
}

export function TetrisBoard({ board, ghostCellIndices, hasStarted, onStart }: TetrisBoardProps) {
  const ghostSet = new Set(ghostCellIndices)

  return (
    <section className="relative w-full max-w-[320px] rounded-xl border border-slate-500/40 bg-slate-900/45 p-3 shadow-2xl backdrop-blur-sm">
      <h1 className="mb-3 text-center text-2xl font-bold tracking-wide">Simple Tetris</h1>
      <div aria-label="tetris-board" className="grid grid-cols-10 gap-[2px] rounded-md bg-slate-800/70 p-[2px]">
        {board.flat().map((cell, index) => {
          const isGhostCell = cell === 0 && ghostSet.has(index)
          return (
            <div
              key={index}
              className="h-6 w-6 rounded-sm border border-slate-900/60"
              style={{
                backgroundColor: isGhostCell ? "transparent" : COLOR_BY_VALUE[cell],
                boxShadow: isGhostCell ? "inset 0 0 0 1px rgba(226, 232, 240, 0.1)" : "none",
              }}
            />
          )
        })}
      </div>

      {!hasStarted ? (
        <div className="absolute inset-3 flex items-center justify-center rounded-lg bg-slate-950/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Ready to play?</p>
            <button
              type="button"
              onClick={onStart}
              className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-lg"
            >
              Start Game
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

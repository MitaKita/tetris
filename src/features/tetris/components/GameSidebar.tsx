import { COLOR_BY_VALUE } from "../constants"
import type { Piece } from "../types"

type GameSidebarProps = {
  score: number
  lines: number
  highScore: number
  nextPiece: Piece | null
  hasStarted: boolean
  isRunning: boolean
  isGameOver: boolean
  onTogglePause: () => void
  onRestart: () => void
  onMoveLeft: () => void
  onMoveRight: () => void
  onRotate: () => void
  onDropOne: () => void
  onHardDrop: () => void
}

export function GameSidebar({
  score,
  lines,
  highScore,
  nextPiece,
  hasStarted,
  isRunning,
  isGameOver,
  onTogglePause,
  onRestart,
  onMoveLeft,
  onMoveRight,
  onRotate,
  onDropOne,
  onHardDrop,
}: GameSidebarProps) {
  return (
    <aside className="fixed bottom-2 left-2 right-2 z-20 w-auto space-y-2 rounded-xl border border-slate-500/40 bg-slate-900/70 p-3 shadow-xl backdrop-blur-sm md:static md:w-full md:max-w-sm md:space-y-4 md:bg-slate-900/45 md:p-4">
      <div className="grid grid-cols-3 gap-2 text-center md:hidden">
        <div className="rounded-md bg-slate-800/70 p-2">
          <p className="text-[11px] text-slate-300">Score</p>
          <p className="text-sm font-semibold">{score}</p>
        </div>
        <div className="rounded-md bg-slate-800/70 p-2">
          <p className="text-[11px] text-slate-300">Lines</p>
          <p className="text-sm font-semibold">{lines}</p>
        </div>
        <div className="rounded-md bg-slate-800/70 p-2">
          <p className="text-[11px] text-slate-300">Best</p>
          <p className="text-sm font-semibold">{highScore}</p>
        </div>
      </div>

      <div className="hidden grid-cols-3 gap-3 md:grid">
        <div className="rounded-md bg-slate-800/70 p-3">
          <p className="text-sm text-slate-300">Score</p>
          <p className="text-xl font-semibold">{score}</p>
        </div>
        <div className="rounded-md bg-slate-800/70 p-3">
          <p className="text-sm text-slate-300">Lines</p>
          <p className="text-xl font-semibold">{lines}</p>
        </div>
        <div className="rounded-md bg-slate-800/70 p-3">
          <p className="text-sm text-slate-300">High score</p>
          <p className="text-xl font-semibold">{highScore}</p>
        </div>
      </div>

      <div className="hidden rounded-md bg-slate-800/70 p-3 md:block">
        <p className="text-sm text-slate-300">Next</p>
        <div
          aria-label="next-piece-preview"
          className="mt-3 inline-grid gap-1 rounded-md bg-slate-950 p-2"
          style={{
            gridTemplateColumns: `repeat(${nextPiece?.shape[0]?.length ?? 4}, minmax(0, 1.25rem))`,
          }}
        >
          {(nextPiece?.shape ?? Array.from({ length: 4 }, () => Array(4).fill(0))).flat().map((cell, index) => (
            <div
              key={index}
              className="h-5 w-5 rounded-sm border border-slate-900/60"
              style={{ backgroundColor: COLOR_BY_VALUE[cell ? nextPiece?.color ?? 0 : 0] }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onTogglePause}
          disabled={isGameOver}
          className="rounded-md bg-cyan-600 px-2 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 md:px-3 md:py-2 md:text-sm"
        >
          {!hasStarted ? "Start" : isRunning ? "Pause" : "Resume"}
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="rounded-md bg-emerald-600 px-2 py-1.5 text-xs font-medium text-white md:px-3 md:py-2 md:text-sm"
        >
          Restart
        </button>
      </div>

      {isGameOver ? <p className="rounded-md bg-rose-950 px-3 py-2 text-rose-300">Game Over</p> : null}

      <div className="hidden space-y-2 text-sm text-slate-300 md:block">
        <p>Controls:</p>
        <p>Left/Right: Move</p>
        <p>Up: Rotate</p>
        <p>Down: Soft drop</p>
        <p>Space: Hard drop</p>
        <p>P: Pause</p>
        <p>R: Resume</p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm md:hidden">
        <button type="button" onClick={onMoveLeft} className="rounded bg-slate-700/90 p-2">
          Left
        </button>
        <button type="button" onClick={onRotate} className="rounded bg-slate-700/90 p-2">
          Rotate
        </button>
        <button type="button" onClick={onMoveRight} className="rounded bg-slate-700/90 p-2">
          Right
        </button>
        <button type="button" onClick={onDropOne} className="col-span-2 rounded bg-slate-700/90 p-2">
          Down
        </button>
        <button type="button" onClick={onHardDrop} className="rounded bg-slate-700/90 p-2">
          Drop
        </button>
      </div>
    </aside>
  )
}

"use client"

import { GameSidebar } from "../features/tetris/components/GameSidebar"
import { TetrisBackdrop } from "../features/tetris/components/TetrisBackdrop"
import { TetrisBoard } from "../features/tetris/components/TetrisBoard"
import { useTetrisGame } from "../features/tetris/useTetrisGame"

export default function Home() {
  const {
    boardWithPiece,
    ghostCellIndices,
    nextPiece,
    score,
    lines,
    highScore,
    isRunning,
    isGameOver,
    controls,
    mobileControls,
  } =
    useTetrisGame()

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-slate-950 px-4 py-8 text-slate-100">
      <TetrisBackdrop />
      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-6 md:flex-row md:items-start md:justify-center">
        <TetrisBoard board={boardWithPiece} ghostCellIndices={ghostCellIndices} />
        <GameSidebar
          score={score}
          lines={lines}
          highScore={highScore}
          nextPiece={nextPiece}
          isRunning={isRunning}
          isGameOver={isGameOver}
          onTogglePause={controls.togglePause}
          onRestart={controls.restart}
          onMoveLeft={mobileControls.moveLeft}
          onMoveRight={mobileControls.moveRight}
          onRotate={mobileControls.rotate}
          onDropOne={mobileControls.dropOne}
          onHardDrop={mobileControls.hardDrop}
        />
      </main>
    </div>
  )
}

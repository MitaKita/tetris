"use client"

import { GameSidebar } from "../features/tetris/components/GameSidebar"
import { TetrisBoard } from "../features/tetris/components/TetrisBoard"
import { useTetrisGame } from "../features/tetris/useTetrisGame"

export default function Home() {
  const { boardWithPiece, nextPiece, score, lines, highScore, isRunning, isGameOver, controls, mobileControls } =
    useTetrisGame()

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <main className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 md:flex-row md:items-start md:justify-center">
        <TetrisBoard board={boardWithPiece} />
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

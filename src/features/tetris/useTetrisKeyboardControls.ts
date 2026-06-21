import { useEffect } from "react"
import type { TetrisControls } from "./useTetrisEngine"

export function useTetrisKeyboardControls(
  controls: TetrisControls,
  isRunning: boolean,
  isGameOver: boolean,
) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isGameOver) {
        return
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault()
        controls.moveHorizontally(-1)
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        controls.moveHorizontally(1)
      } else if (event.key === "ArrowDown") {
        event.preventDefault()
        controls.dropOneRow()
      } else if (event.key === "ArrowUp") {
        event.preventDefault()
        controls.rotate()
      } else if (event.key === " " || event.code === "Space") {
        event.preventDefault()
        controls.hardDrop()
      } else if (event.code === "KeyP" && isRunning) {
        event.preventDefault()
        controls.togglePause()
      } else if (event.code === "KeyR" && !isRunning) {
        event.preventDefault()
        controls.togglePause()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [controls, isGameOver, isRunning])
}

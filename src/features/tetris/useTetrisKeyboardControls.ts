import { useEffect } from "react"
import type { TetrisControls } from "./useTetrisEngine"

export function useTetrisKeyboardControls(controls: TetrisControls) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
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
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [controls])
}

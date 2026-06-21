import { useTetrisEngine } from "./useTetrisEngine"
import { useTetrisKeyboardControls } from "./useTetrisKeyboardControls"
import { useTetrisMobileControls } from "./useTetrisMobileControls"

export function useTetrisGame() {
  const game = useTetrisEngine()
  useTetrisKeyboardControls(game.controls)
  const mobileControls = useTetrisMobileControls(game.controls)
  return {
    ...game,
    mobileControls,
  }
}

import { useCallback, useMemo } from "react"
import type { TetrisControls } from "./useTetrisEngine"

export type TetrisMobileControls = {
  moveLeft: () => void
  moveRight: () => void
  rotate: () => void
  dropOne: () => void
  hardDrop: () => void
}

export function useTetrisMobileControls(
  controls: TetrisControls,
): TetrisMobileControls {
  const moveLeft = useCallback(() => {
    controls.moveHorizontally(-1)
  }, [controls])

  const moveRight = useCallback(() => {
    controls.moveHorizontally(1)
  }, [controls])

  const rotate = useCallback(() => {
    controls.rotate()
  }, [controls])

  const dropOne = useCallback(() => {
    controls.dropOneRow()
  }, [controls])

  const hardDrop = useCallback(() => {
    controls.hardDrop()
  }, [controls])

  return useMemo(
    () => ({
      moveLeft,
      moveRight,
      rotate,
      dropOne,
      hardDrop,
    }),
    [dropOne, hardDrop, moveLeft, moveRight, rotate],
  )
}

import { useCallback, useState } from "react"
import { scoreForLines } from "./logic"

export function useTetrisScoring() {
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)

  const addLinesAndScore = useCallback((linesCleared: number) => {
    if (linesCleared > 0) {
      setLines((prev) => prev + linesCleared)
      setScore((prev) => prev + scoreForLines(linesCleared))
    }
  }, [])

  const reset = useCallback(() => {
    setScore(0)
    setLines(0)
  }, [])

  return {
    score,
    lines,
    addLinesAndScore,
    reset,
  }
}

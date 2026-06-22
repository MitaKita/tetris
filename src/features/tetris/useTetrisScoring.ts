import { useCallback, useEffect, useReducer, useRef } from "react"
import { scoreForLines } from "./logic"

const HIGH_SCORE_STORAGE_KEY = "tetris.highScore"

function readStoredHighScore() {
  if (typeof window === "undefined") {
    return 0
  }

  const storedHighScore = window.sessionStorage.getItem(HIGH_SCORE_STORAGE_KEY)
  const parsedHighScore = Number(storedHighScore)

  return Number.isFinite(parsedHighScore) && parsedHighScore > 0
    ? parsedHighScore
    : 0
}

export function useTetrisScoring() {
  const [state, dispatch] = useReducer(scoringReducer, {
    score: 0,
    lines: 0,
    highScore: 0,
  })
  const hasLoadedHighScore = useRef(false)

  useEffect(() => {
    dispatch({ type: "hydrate", highScore: readStoredHighScore() })
    hasLoadedHighScore.current = true
  }, [])

  useEffect(() => {
    if (!hasLoadedHighScore.current) {
      return
    }

    window.sessionStorage.setItem(
      HIGH_SCORE_STORAGE_KEY,
      String(state.highScore),
    )
  }, [state.highScore])

  const addLinesAndScore = useCallback(
    (linesCleared: number, isAllClear = false) => {
      if (linesCleared > 0) {
        dispatch({ type: "add", linesCleared, isAllClear })
      }
    },
    [],
  )

  const finalizeRun = useCallback(() => {
    dispatch({ type: "finalize" })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: "reset" })
  }, [])

  return {
    score: state.score,
    lines: state.lines,
    highScore: state.highScore,
    addLinesAndScore,
    finalizeRun,
    reset,
  }
}

type ScoringState = {
  score: number
  lines: number
  highScore: number
}

type ScoringAction =
  | {
      type: "add"
      linesCleared: number
      isAllClear?: boolean
    }
  | {
      type: "reset"
    }
  | {
      type: "finalize"
    }
  | {
      type: "hydrate"
      highScore: number
    }

function getAllClearBonus(linesCleared: number): number {
  // Bonus amounts: 1 line = 1000, 2 lines = 2000, 3 lines = 4000, 4 lines = 8000
  const bonuses: Record<number, number> = {
    1: 1000,
    2: 2000,
    3: 4000,
    4: 8000,
  }
  return bonuses[Math.min(linesCleared, 4)] ?? 0
}

function scoringReducer(
  state: ScoringState,
  action: ScoringAction,
): ScoringState {
  switch (action.type) {
    case "add": {
      const scoreIncrease = scoreForLines(action.linesCleared)
      let totalIncrease = scoreIncrease

      if (action.isAllClear) {
        const allClearBonus = getAllClearBonus(action.linesCleared)
        totalIncrease += allClearBonus
      }

      const nextScore = state.score + totalIncrease
      return {
        ...state,
        score: nextScore,
        lines: state.lines + action.linesCleared,
      }
    }
    case "finalize":
      return {
        ...state,
        highScore: Math.max(state.highScore, state.score),
      }
    case "reset":
      return {
        ...state,
        score: 0,
        lines: 0,
      }
    case "hydrate":
      return {
        ...state,
        highScore: Math.max(state.highScore, action.highScore),
      }
    default:
      return state
  }
}

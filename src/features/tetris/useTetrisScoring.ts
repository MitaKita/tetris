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

  const addLinesAndScore = useCallback((linesCleared: number) => {
    if (linesCleared > 0) {
      dispatch({ type: "add", linesCleared })
    }
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: "reset" })
  }, [])

  return {
    score: state.score,
    lines: state.lines,
    highScore: state.highScore,
    addLinesAndScore,
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
    }
  | {
      type: "reset"
    }
  | {
      type: "hydrate"
      highScore: number
    }

function scoringReducer(
  state: ScoringState,
  action: ScoringAction,
): ScoringState {
  switch (action.type) {
    case "add": {
      const scoreIncrease = scoreForLines(action.linesCleared)
      const nextScore = state.score + scoreIncrease
      return {
        ...state,
        score: nextScore,
        lines: state.lines + action.linesCleared,
        highScore: Math.max(state.highScore, nextScore),
      }
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

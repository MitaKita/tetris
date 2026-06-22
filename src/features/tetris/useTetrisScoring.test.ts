import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"
import { useTetrisScoring } from "./useTetrisScoring"

describe("useTetrisScoring", () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  it("starts with score and lines at zero", () => {
    const { result } = renderHook(() => useTetrisScoring())

    expect(result.current.score).toBe(0)
    expect(result.current.lines).toBe(0)
    expect(result.current.highScore).toBe(0)
  })

  it("adds lines and score for a single line clear", () => {
    const { result } = renderHook(() => useTetrisScoring())

    act(() => {
      result.current.addLinesAndScore(1)
    })

    expect(result.current.lines).toBe(1)
    expect(result.current.score).toBe(100)
    expect(result.current.highScore).toBe(0)
  })

  it("adds lines and score for a tetris clear", () => {
    const { result } = renderHook(() => useTetrisScoring())

    act(() => {
      result.current.addLinesAndScore(4)
    })

    expect(result.current.lines).toBe(4)
    expect(result.current.score).toBe(800)
    expect(result.current.highScore).toBe(0)
  })

  it("accumulates score and lines across multiple clears", () => {
    const { result } = renderHook(() => useTetrisScoring())

    act(() => {
      result.current.addLinesAndScore(1)
      result.current.addLinesAndScore(2)
      result.current.addLinesAndScore(3)
    })

    expect(result.current.lines).toBe(6)
    expect(result.current.score).toBe(900)
    expect(result.current.highScore).toBe(0)
  })

  it("ignores non-positive line clear values", () => {
    const { result } = renderHook(() => useTetrisScoring())

    act(() => {
      result.current.addLinesAndScore(0)
      result.current.addLinesAndScore(-2)
    })

    expect(result.current.lines).toBe(0)
    expect(result.current.score).toBe(0)
    expect(result.current.highScore).toBe(0)
  })

  it("commits high score only when a run is finalized", () => {
    const { result } = renderHook(() => useTetrisScoring())

    act(() => {
      result.current.addLinesAndScore(2)
    })

    expect(result.current.highScore).toBe(0)

    act(() => {
      result.current.finalizeRun()
    })

    expect(result.current.highScore).toBe(300)
  })

  it("resets score and lines to zero without lowering the high score", () => {
    const { result } = renderHook(() => useTetrisScoring())

    act(() => {
      result.current.addLinesAndScore(2)
      result.current.finalizeRun()
      result.current.reset()
    })

    expect(result.current.lines).toBe(0)
    expect(result.current.score).toBe(0)
    expect(result.current.highScore).toBe(300)
  })

  it("loads the saved session high score", async () => {
    window.sessionStorage.setItem("tetris.highScore", "1234")

    const { result } = renderHook(() => useTetrisScoring())

    await waitFor(() => {
      expect(result.current.highScore).toBe(1234)
    })
  })

  it("applies all-clear bonus when board is emptied", () => {
    const { result } = renderHook(() => useTetrisScoring())

    act(() => {
      result.current.addLinesAndScore(4, true)
    })

    expect(result.current.lines).toBe(4)
    expect(result.current.score).toBe(800 + 8000) // Regular score + all-clear bonus
  })

  it("applies correct all-clear bonus for 1 line", () => {
    const { result } = renderHook(() => useTetrisScoring())

    act(() => {
      result.current.addLinesAndScore(1, true)
    })

    expect(result.current.score).toBe(100 + 1000)
  })

  it("applies correct all-clear bonus for 2 lines", () => {
    const { result } = renderHook(() => useTetrisScoring())

    act(() => {
      result.current.addLinesAndScore(2, true)
    })

    expect(result.current.score).toBe(300 + 2000)
  })

  it("applies correct all-clear bonus for 3 lines", () => {
    const { result } = renderHook(() => useTetrisScoring())

    act(() => {
      result.current.addLinesAndScore(3, true)
    })

    expect(result.current.score).toBe(500 + 4000)
  })
})

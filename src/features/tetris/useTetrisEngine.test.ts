import { act, renderHook } from "@testing-library/react"
import { createElement, StrictMode, type ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useTetrisEngine } from "./useTetrisEngine"

const strictModeWrapper = ({ children }: { children: ReactNode }) => {
  return createElement(StrictMode, null, children)
}

describe("useTetrisEngine", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random")
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("spawns the piece shown in the preview after a lock", () => {
    vi.mocked(Math.random)
      .mockReturnValueOnce(0.01)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.8)

    const { result } = renderHook(() => useTetrisEngine(), {
      wrapper: strictModeWrapper,
    })

    expect(result.current.nextPiece?.color).toBe(4)

    act(() => {
      result.current.controls.hardDrop()
    })

    expect(result.current.nextPiece?.color).toBe(6)
    expect(result.current.boardWithPiece[0][4]).toBe(4)
    expect(result.current.boardWithPiece[0][5]).toBe(4)
    expect(result.current.boardWithPiece[1][4]).toBe(4)
    expect(result.current.boardWithPiece[1][5]).toBe(4)
  })
})

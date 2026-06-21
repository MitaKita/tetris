import { render, screen } from "@testing-library/react"
import Home from "./page"

describe("Home page", () => {
  it("renders the tetris game UI", () => {
    render(<Home />)

    expect(screen.getByRole("heading", { name: /simple tetris/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/tetris-board/i)).toBeInTheDocument()
    expect(screen.getByText(/^score$/i)).toBeInTheDocument()
    expect(screen.getByText(/^lines$/i)).toBeInTheDocument()
    expect(screen.getByText(/^high score$/i)).toBeInTheDocument()
    expect(screen.getByText(/next/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/next-piece-preview/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /restart/i })).toBeInTheDocument()

    const cells = screen.getByLabelText(/tetris-board/i).querySelectorAll("div")
    expect(cells).toHaveLength(BOARD_CELL_COUNT)
  })
})

const BOARD_CELL_COUNT = 200
"use client"

export function TetrisBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.18),rgba(51,65,85,0.28))]" />
    </div>
  )
}

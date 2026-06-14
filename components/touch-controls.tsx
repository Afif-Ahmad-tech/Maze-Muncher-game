'use client'

import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

type Dir = 'up' | 'down' | 'left' | 'right'

type TouchControlsProps = {
  onMove: (dir: Dir) => void
  disabled?: boolean
}

function Pad({
  dir,
  onMove,
  disabled,
  children,
  label,
}: {
  dir: Dir
  onMove: (dir: Dir) => void
  disabled?: boolean
  children: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onPointerDown={(e) => {
        e.preventDefault()
        onMove(dir)
      }}
      className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-card text-primary transition-colors active:bg-primary active:text-primary-foreground disabled:opacity-40"
    >
      {children}
    </button>
  )
}

export function TouchControls({ onMove, disabled }: TouchControlsProps) {
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-2 sm:hidden">
      <div />
      <Pad dir="up" onMove={onMove} disabled={disabled} label="Move up">
        <ChevronUp />
      </Pad>
      <div />
      <Pad dir="left" onMove={onMove} disabled={disabled} label="Move left">
        <ChevronLeft />
      </Pad>
      <div />
      <Pad dir="right" onMove={onMove} disabled={disabled} label="Move right">
        <ChevronRight />
      </Pad>
      <div />
      <Pad dir="down" onMove={onMove} disabled={disabled} label="Move down">
        <ChevronDown />
      </Pad>
      <div />
    </div>
  )
}

import { Layers, Trophy, Apple, Compass } from 'lucide-react'

type HudProps = {
  level: number
  score: number
  foodLeft: number
  hint: string
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
      <span className="text-accent">{icon}</span>
      <div className="leading-tight">
        <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className="block font-mono text-lg font-black text-foreground">
          {value}
        </span>
      </div>
    </div>
  )
}

export function Hud({ level, score, foodLeft, hint }: HudProps) {
  return (
    <div className="w-full max-w-[560px]">
      <div className="grid grid-cols-3 gap-2">
        <Stat icon={<Layers size={18} />} label="Level" value={level} />
        <Stat icon={<Trophy size={18} />} label="Score" value={score} />
        <Stat icon={<Apple size={18} />} label="Food" value={foodLeft} />
      </div>
      {hint && (
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2">
          <Compass size={16} className="shrink-0 text-accent" />
          <span className="font-mono text-sm text-accent">
            {hint}
          </span>
        </div>
      )}
    </div>
  )
}

interface ReadingGaugeProps {
  currentValue: number
  threshold: number
  label?: string
}

/**
 * Barra de progreso visual que compara la lectura actual contra el umbral.
 */
export function ReadingGauge({ currentValue, threshold, label = 'Nivel respecto al umbral' }: ReadingGaugeProps) {
  const ratio = Math.min((currentValue / threshold) * 100, 150)
  const isOver = currentValue > threshold
  const isWarning = ratio > 80 && !isOver

  const barColor = isOver
    ? 'from-rose-500 to-orange-500'
    : isWarning
      ? 'from-amber-400 to-yellow-500'
      : 'from-cyan-400 to-teal-400'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span className={isOver ? 'font-semibold text-rose-300' : 'text-slate-300'}>
          {ratio.toFixed(0)}%
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-800/80 ring-1 ring-white/5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(ratio, 100)}%` }}
        />
      </div>
    </div>
  )
}

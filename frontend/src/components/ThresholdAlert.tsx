/**
 * Alerta visual cuando la lectura supera el umbral configurado.
 * Cumple el requisito de mostrar visualmente el exceso de umbral en el frontend.
 * No renderiza nada si el valor está dentro del rango aceptable.
 */
export function ThresholdAlert({ currentValue, threshold }: { currentValue: number; threshold: number }) {
  if (currentValue <= threshold) {
    return null
  }

  return (
    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/15 to-orange-500/10 px-4 py-3.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-lg">
        ⚠️
      </span>
      <div>
        <p className="text-sm font-semibold text-amber-100">Umbral superado</p>
        <p className="mt-0.5 text-sm text-amber-200/80">
          Valor actual <span className="font-bold text-amber-100">{currentValue.toFixed(1)}</span>
          {' '}supera el umbral de <span className="font-bold text-amber-100">{threshold.toFixed(1)}</span>
        </p>
      </div>
    </div>
  )
}

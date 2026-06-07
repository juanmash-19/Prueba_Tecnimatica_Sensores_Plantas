/**
 * Muestra una alerta visual cuando el valor actual supera el umbral configurado.
 * No renderiza nada si la lectura está dentro del rango aceptable.
 */
export function ThresholdAlert({ currentValue, threshold }: { currentValue: number; threshold: number }) {
  if (currentValue <= threshold) {
    return null
  }

  return (
    <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      ⚠️ Valor actual ({currentValue.toFixed(1)}) supera el umbral ({threshold.toFixed(1)})
    </div>
  )
}

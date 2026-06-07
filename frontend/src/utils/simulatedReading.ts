/**
 * Genera una lectura simulada determinística para un monitoreo.
 * No existe tabla de lecturas reales en la BD; esta función permite demostrar
 * las alertas de umbral de forma consistente (ver DECISIONS.md).
 * Usa una semilla basada en IDs para que el valor sea igual entre recargas.
 * Aproximadamente el 40 % de las combinaciones superan el umbral.
 *
 * @param monitoringId - ID del monitoreo (parte de la semilla).
 * @param sensorId - ID del sensor (parte de la semilla).
 * @param threshold - Valor umbral configurado para el monitoreo.
 * @returns Lectura simulada con un decimal de precisión.
 */
export function getSimulatedReading(monitoringId: number, sensorId: number, threshold: number): number {
  const seed = monitoringId * 37 + sensorId * 13

  if (seed % 5 < 2) {
    return Number((threshold * (1.1 + (seed % 50) / 100)).toFixed(1))
  }

  return Number((threshold * (0.4 + (seed % 40) / 100)).toFixed(1))
}

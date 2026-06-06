export function getSimulatedReading(monitoringId: number, sensorId: number, threshold: number): number {
  const seed = monitoringId * 37 + sensorId * 13

  if (seed % 5 < 2) {
    return Number((threshold * (1.1 + (seed % 50) / 100)).toFixed(1))
  }

  return Number((threshold * (0.4 + (seed % 40) / 100)).toFixed(1))
}

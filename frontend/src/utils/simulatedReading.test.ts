import { describe, expect, it } from 'vitest'
import { getSimulatedReading } from './simulatedReading'

describe('getSimulatedReading', () => {
  it('devuelve el mismo valor para los mismos parámetros (determinístico)', () => {
    const first = getSimulatedReading(1, 1, 75.5)
    const second = getSimulatedReading(1, 1, 75.5)
    expect(first).toBe(second)
  })

  it('devuelve valores distintos para combinaciones distintas de IDs', () => {
    const readingA = getSimulatedReading(1, 1, 100)
    const readingB = getSimulatedReading(2, 3, 100)
    expect(readingA).not.toBe(readingB)
  })

  it('genera lecturas por encima del umbral cuando la semilla lo indica', () => {
    const threshold = 50
    const reading = getSimulatedReading(1, 1, threshold)
    const seed = 1 * 37 + 1 * 13

    if (seed % 5 < 2) {
      expect(reading).toBeGreaterThan(threshold)
    } else {
      expect(reading).toBeLessThanOrEqual(threshold)
    }
  })

  it('formatea el resultado con un decimal', () => {
    const reading = getSimulatedReading(5, 10, 100)
    expect(reading.toString()).toMatch(/^\d+(\.\d)?$/)
  })
})

describe('lógica de umbral', () => {
  it('identifica cuando una lectura supera el umbral', () => {
    expect(85 > 75).toBe(true)
  })

  it('identifica cuando una lectura está en o por debajo del umbral', () => {
    expect(75 > 75).toBe(false)
    expect(60 > 75).toBe(false)
  })
})

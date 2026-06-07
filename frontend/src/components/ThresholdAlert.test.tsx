import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ThresholdAlert } from './ThresholdAlert'

describe('ThresholdAlert', () => {
  it('no renderiza nada cuando el valor está dentro del umbral', () => {
    const { container } = render(<ThresholdAlert currentValue={70} threshold={75} />)
    expect(container.firstChild).toBeNull()
  })

  it('no renderiza nada cuando el valor es igual al umbral', () => {
    const { container } = render(<ThresholdAlert currentValue={75} threshold={75} />)
    expect(container.firstChild).toBeNull()
  })

  it('muestra alerta cuando el valor supera el umbral', () => {
    render(<ThresholdAlert currentValue={85.3} threshold={75} />)
    expect(screen.getByText(/supera el umbral/i)).toBeInTheDocument()
    expect(screen.getByText(/85\.3/)).toBeInTheDocument()
    expect(screen.getByText(/75\.0/)).toBeInTheDocument()
  })
})

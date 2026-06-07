import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MonitoringStatusBadge } from './MonitoringStatusBadge'

describe('MonitoringStatusBadge', () => {
  it('muestra "Activo" para estado activo', () => {
    render(<MonitoringStatusBadge status="activo" />)
    expect(screen.getByText('Activo')).toBeInTheDocument()
  })

  it('muestra "Pausado" para estado pausado', () => {
    render(<MonitoringStatusBadge status="pausado" />)
    expect(screen.getByText('Pausado')).toBeInTheDocument()
  })
})

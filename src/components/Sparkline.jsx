import React from 'react'

export default function Sparkline({ data = [], width = 240, height = 64, stroke = '#22c55e' }) {
  if (!data || data.length < 2) return null
  const numericWidth = typeof width === 'number' ? width : 240
  const min = Math.min(...data)
  const max = Math.max(...data)
  const dx = numericWidth / (data.length - 1)
  const normY = (v) => {
    if (max === min) return height / 2
    const t = (v - min) / (max - min)
    return height - t * height
  }
  const d = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * dx} ${normY(v)}`).join(' ')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${numericWidth} ${height}`} preserveAspectRatio="none">
      <path d={d} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

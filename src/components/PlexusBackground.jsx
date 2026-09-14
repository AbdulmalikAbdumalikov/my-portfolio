import { useEffect, useRef } from 'react'

export default function PlexusBackground({ subtle = false }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pointer = { x: -1000, y: -1000, active: false }
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let points = []
    let spawned = []
    let raf = 0
    let running = true

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(devicePixelRatio || 1, 1.5)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = innerWidth < 600 ? 28 : innerWidth < 1000 ? 52 : 86
      points = Array.from({ length: count }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - .5) * .22,
        vy: (Math.random() - .5) * .22,
      }))
    }

    const movePoint = (point, rect) => {
      point.x += point.vx
      point.y += point.vy
      if (point.x < 0 || point.x > rect.width) point.vx *= -1
      if (point.y < 0 || point.y > rect.height) point.vy *= -1
    }

    const draw = time => {
      if (!running) return
      const rect = canvas.getBoundingClientRect()
      const dark = document.documentElement.dataset.theme !== 'light'
      ctx.clearRect(0, 0, rect.width, rect.height)
      spawned = spawned.filter(point => time - point.born < 10000)
      if (!reduce) {
        points.forEach(point => movePoint(point, rect))
        spawned.forEach(point => movePoint(point, rect))
      }
      const nodes = [...points, ...spawned]
      const all = pointer.active ? [...nodes, pointer] : nodes
      for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
        const a = all[i]
        const b = all[j]
        const distance = Math.hypot(a.x - b.x, a.y - b.y)
        const pointerLine = a === pointer || b === pointer
        const limit = pointerLine ? 205 : 150
        if (distance < limit) {
          const alpha = (1 - distance / limit) * (pointerLine ? .46 : .16) * (subtle ? .55 : 1)
          ctx.strokeStyle = dark ? `rgba(124,199,255,${alpha})` : `rgba(57,121,246,${alpha})`
          ctx.lineWidth = pointerLine ? 1.3 : .72
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }
      const iconNodes = Array.from(document.querySelectorAll('.tech-floats span')).map(element => {
        const iconRect = element.getBoundingClientRect()
        return { x: iconRect.left + iconRect.width / 2 - rect.left, y: iconRect.top + iconRect.height / 2 - rect.top }
      }).filter(icon => icon.x > -70 && icon.x < rect.width + 70 && icon.y > -70 && icon.y < rect.height + 70)
      for (const point of nodes) for (const icon of iconNodes) {
        const distance = Math.hypot(point.x - icon.x, point.y - icon.y)
        const limit = 190
        if (distance >= limit) continue
        const alpha = (1 - distance / limit) * (subtle ? .2 : .34)
        ctx.strokeStyle = dark ? `rgba(124,199,255,${alpha})` : `rgba(57,121,246,${alpha})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(point.x, point.y)
        ctx.lineTo(icon.x, icon.y)
        ctx.stroke()
      }
      nodes.forEach(point => {
        const life = point.born ? Math.max(0, 1 - (time - point.born) / 10000) : 1
        ctx.fillStyle = dark ? `rgba(144,205,255,${.74 * life})` : `rgba(57,121,246,${.64 * life})`
        ctx.beginPath()
        ctx.arc(point.x, point.y, point.born ? 3.4 : 2.15, 0, Math.PI * 2)
        ctx.fill()
        if (point.born) {
          ctx.strokeStyle = dark ? `rgba(124,199,255,${.24 * life})` : `rgba(57,121,246,${.2 * life})`
          ctx.beginPath()
          ctx.arc(point.x, point.y, 8 + (1 - life) * 9, 0, Math.PI * 2)
          ctx.stroke()
        }
      })
      if (pointer.active) {
        ctx.fillStyle = dark ? '#7cc7ff' : '#3979f6'
        ctx.beginPath()
        ctx.arc(pointer.x, pointer.y, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = dark ? 'rgba(124,199,255,.35)' : 'rgba(57,121,246,.28)'
        ctx.beginPath()
        ctx.arc(pointer.x, pointer.y, 13, 0, Math.PI * 2)
        ctx.stroke()
      }
      raf = requestAnimationFrame(draw)
    }

    const move = event => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      pointer.active = true
    }
    const spawn = event => {
      const rect = canvas.getBoundingClientRect()
      spawned.push({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        vx: (Math.random() - .5) * 1.25,
        vy: (Math.random() - .5) * 1.25,
        born: performance.now(),
      })
    }
    const leave = () => { pointer.active = false }
    const visibility = () => {
      running = !document.hidden
      if (running) raf = requestAnimationFrame(draw)
      else cancelAnimationFrame(raf)
    }

    resize()
    raf = requestAnimationFrame(draw)
    addEventListener('resize', resize)
    document.addEventListener('visibilitychange', visibility)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerdown', spawn)
    canvas.addEventListener('pointerleave', leave)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', visibility)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerdown', spawn)
      canvas.removeEventListener('pointerleave', leave)
    }
  }, [subtle])

  return <canvas ref={canvasRef} className="plexus" aria-hidden="true" />
}

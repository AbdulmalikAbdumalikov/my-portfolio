import { StrictMode, useEffect, useMemo, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import './plexus.css'
import './ambient.css'
import './hero-polish.css'
import './phase-two.css'
import './layout-polish.css'
import './contact.css'
import App from './App'

function AmbientUI() {
  const dot = useRef(null)
  useEffect(() => {
    if (matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return
    const move = event => { dot.current.style.transform = `translate(${event.clientX}px, ${event.clientY}px)` }
    const scroll = () => { document.documentElement.style.setProperty('--scroll-progress', `${scrollY / (document.documentElement.scrollHeight - innerHeight) * 100}%`) }
    addEventListener('pointermove', move); addEventListener('scroll', scroll, { passive: true }); scroll()
    return () => { removeEventListener('pointermove', move); removeEventListener('scroll', scroll) }
  }, [])
  useEffect(() => {
    if (matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return undefined
    const tilt = event => {
      const card = event.target.closest?.('[data-tilt]')
      if (!card) return
      card.classList.remove('tilt-returning')
      const rect = card.getBoundingClientRect()
      const horizontal = (event.clientX - rect.left) / rect.width - .5
      const vertical = (event.clientY - rect.top) / rect.height - .5
      card.style.setProperty('--tilt-x', `${vertical * 5}deg`)
      card.style.setProperty('--tilt-y', `${horizontal * -6}deg`)
      card.style.setProperty('--tilt-lift', '-3px')
    }
    const reset = event => {
      const card = event.target.closest?.('[data-tilt]')
      if (!card || card.contains(event.relatedTarget)) return
      card.classList.add('tilt-returning')
      card.style.removeProperty('--tilt-x')
      card.style.removeProperty('--tilt-y')
      card.style.removeProperty('--tilt-lift')
      setTimeout(() => card.classList.remove('tilt-returning'), 720)
    }
    document.addEventListener('pointermove', tilt)
    document.addEventListener('pointerout', reset)
    return () => { document.removeEventListener('pointermove', tilt); document.removeEventListener('pointerout', reset) }
  }, [])
  const tech = [
    ['Java', '/original-icons/core-tech/java.svg'],
    ['JavaScript', '/original-icons/core-tech/javascript.svg'],
    ['React', '/original-icons/core-tech/react.svg'],
    ['PostgreSQL', '/original-icons/core-tech/postgresql.svg'],
    ['Telegram', '/original-icons/core-tech/telegram.svg'],
    ['Arduino', '/original-icons/robotics/arduino.svg'],
    ['ESP32', '/original-icons/robotics/esp32.svg'],
    ['Git', '/original-icons/dev-tools/git.svg'],
    ['Spring', '/original-icons/core-tech/spring-boot.svg'],
    ['Tailwind', '/original-icons/core-tech/tailwind-css.svg'],
    ['Figma', '/original-icons/design-media/figma.svg'],
    ['Linux', '/original-icons/os/linux.svg'],
    ['Postman', '/original-icons/dev-tools/postman.svg'],
    ['IoT', '/original-icons/robotics/iot.svg'],
  ]
  const floaters = useMemo(() => tech.map(([label, src], index) => {
    const onLeft = index % 2 === 0
    const edgeRow = Math.floor(index / 2)
    return {
      label,
      src,
      style: {
        '--x': `${onLeft ? 1.5 + Math.random() * 7 : 91.5 + Math.random() * 6}%`,
        '--y': `${7 + edgeRow * 13 + (Math.random() - .5) * 4}%`,
        '--dx': `${onLeft ? 10 + Math.random() * 34 : -10 - Math.random() * 34}px`,
        '--dy': `${(Math.random() - .5) * 190}px`,
        '--dx2': `${onLeft ? 5 + Math.random() * 24 : -5 - Math.random() * 24}px`,
        '--dy2': `${(Math.random() - .5) * 120}px`,
        '--duration': `${9 + Math.random() * 9}s`,
        '--delay': `${-Math.random() * 8}s`,
      },
    }
  }), [])
  return <><div className="scroll-progress"/><div ref={dot} className="cursor-dot" aria-hidden="true"/><div className="tech-floats" aria-hidden="true">{floaters.map(item => <span key={item.label} style={item.style}><img src={item.src} alt="" /></span>)}</div></>
}

createRoot(document.getElementById('root')).render(
  <StrictMode><AmbientUI /><App /></StrictMode>,
)

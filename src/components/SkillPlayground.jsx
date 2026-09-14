import { useEffect, useRef, useState } from 'react'
import { Box, Grid3X3, Type, X } from 'lucide-react'
import { skillDetails, skills } from '../data/skills'

const faceNames = ['front', 'back', 'right', 'left', 'top', 'bottom']

function SkillMark({ skill }) {
  return skill.icon ? <img src={skill.icon} alt="" /> : <b>{skill.badge}</b>
}

function Cube({ skill, index, register }) {
  return <div className="cube-particle" ref={element => register(index, element)}>
    <div className="skill-cube">
      {faceNames.map(face => <div className={`skill-cube-face face-${face}`} key={face}><SkillMark skill={skill} /></div>)}
    </div>
  </div>
}

export default function SkillPlayground({ title, eyebrow }) {
  const [mode, setMode] = useState('icon')
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [cubeSize, setCubeSize] = useState(() => innerWidth < 700 ? 70 : innerWidth < 1100 ? 92 : 116)
  const stageRef = useRef(null)
  const cubeRefs = useRef([])
  const cubeSizeRef = useRef(cubeSize)
  const pointer = useRef({ x: -1000, y: -1000, active: false })
  const modes = [['3d', '3D', Box], ['text', 'Text', Type], ['icon', 'Icon', Grid3X3]]

  const selectMode = value => {
    if (value === '3d' && mode !== '3d') {
      const approved = window.confirm("3D rejimi kompyuteringizni qiynashi mumkin. Agar kompyuteringiz kuchsiz bo‘lsa, uni ochishni tavsiya qilmaymiz.\n\n3D rejimini ochasizmi?")
      if (!approved) return
    }
    setSelectedSkill(null)
    setMode(value)
  }

  useEffect(() => {
    if (!selectedSkill) return undefined
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = event => event.key === 'Escape' && setSelectedSkill(null)
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [selectedSkill])

  useEffect(() => {
    if (mode !== '3d') return undefined
    const stage = stageRef.current
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
    let particles = []
    let raf = 0
    let last = performance.now()

    const setup = () => {
      const rect = stage.getBoundingClientRect()
      const size = cubeSizeRef.current
      const columns = Math.ceil(Math.sqrt(skills.length * rect.width / rect.height))
      const rows = Math.ceil(skills.length / columns)
      const gapX = (rect.width - size * 1.4) / Math.max(1, columns - 1)
      const gapY = (rect.height - size * 1.4) / Math.max(1, rows - 1)
      particles = skills.map((skill, index) => {
        const column = index % columns
        const row = Math.floor(index / columns)
        return {
          x: size * .7 + column * gapX + (Math.random() - .5) * 20,
          y: size * .7 + row * gapY + (Math.random() - .5) * 20,
          z: (Math.random() - .5) * 150,
          vx: (Math.random() - .5) * .24,
          vy: (Math.random() - .5) * .24,
          rx: Math.random() * 360,
          ry: Math.random() * 360,
          spinX: (Math.random() - .5) * .018,
          spinY: (Math.random() - .5) * .022,
          size,
        }
      })
    }

    const animate = now => {
      const rect = stage.getBoundingClientRect()
      const frame = Math.min(2, (now - last) / 16.667)
      last = now
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      if (!reduceMotion) {
        for (let i = 0; i < particles.length; i++) {
          const a = particles[i]
          a.size += (cubeSizeRef.current - a.size) * Math.min(1, .14 * frame)
          a.vx += (centerX - a.x) * .000012 * frame
          a.vy += (centerY - a.y) * .000012 * frame
          if (pointer.current.active) {
            const dx = a.x - pointer.current.x
            const dy = a.y - pointer.current.y
            const distance = Math.hypot(dx, dy) || 1
            const radius = 165
            if (distance < radius) {
              const force = (1 - distance / radius) * 1.45 * frame
              a.vx += dx / distance * force
              a.vy += dy / distance * force
              a.z += force * 2.2
            }
          }
          a.vx *= .992
          a.vy *= .992
          a.x += a.vx * frame
          a.y += a.vy * frame
          a.rx += a.spinX * 60 * frame
          a.ry += a.spinY * 60 * frame
        }

        // Positional separation plus an elastic impulse keeps cubes from
        // passing through one another, even inside dense clusters.
        for (let pass = 0; pass < 2; pass++) {
          for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
              const a = particles[i]
              const b = particles[j]
              let dx = b.x - a.x
              let dy = b.y - a.y
              let distance = Math.hypot(dx, dy)
              if (distance < .001) {
                const angle = (i * 1.71 + j * 2.37) % (Math.PI * 2)
                dx = Math.cos(angle)
                dy = Math.sin(angle)
                distance = 1
              }
              const minimum = (a.size + b.size) * .56
              if (distance >= minimum) continue

              const nx = dx / distance
              const ny = dy / distance
              const correction = (minimum - distance) * .505
              a.x -= nx * correction
              a.y -= ny * correction
              b.x += nx * correction
              b.y += ny * correction

              const relativeX = b.vx - a.vx
              const relativeY = b.vy - a.vy
              const closingSpeed = relativeX * nx + relativeY * ny
              if (closingSpeed < 0) {
                const impulse = -(1 + .72) * closingSpeed / 2
                a.vx -= impulse * nx
                a.vy -= impulse * ny
                b.vx += impulse * nx
                b.vy += impulse * ny
              }
            }
          }
        }

        for (const a of particles) {
          const edge = a.size * .56
          if (a.x < edge) { a.x = edge; a.vx = Math.abs(a.vx) * .82 }
          if (a.x > rect.width - edge) { a.x = rect.width - edge; a.vx = -Math.abs(a.vx) * .82 }
          if (a.y < edge) { a.y = edge; a.vy = Math.abs(a.vy) * .82 }
          if (a.y > rect.height - edge) { a.y = rect.height - edge; a.vy = -Math.abs(a.vy) * .82 }
        }
      }

      particles.forEach((particle, index) => {
        const element = cubeRefs.current[index]
        if (!element) return
        element.style.setProperty('--cube-size', `${particle.size}px`)
        element.style.transform = `translate3d(${particle.x - particle.size / 2}px,${particle.y - particle.size / 2}px,${particle.z}px) rotateX(${particle.rx}deg) rotateY(${particle.ry}deg)`
      })
      raf = requestAnimationFrame(animate)
    }

    const observer = new ResizeObserver(setup)
    setup()
    observer.observe(stage)
    raf = requestAnimationFrame(animate)
    return () => { cancelAnimationFrame(raf); observer.disconnect() }
  }, [mode])

  const trackPointer = event => {
    const rect = event.currentTarget.getBoundingClientRect()
    pointer.current = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true }
  }

  const magnifyIcons = event => {
    if (event.pointerType === 'touch') return
    const grid = event.currentTarget
    const gridRect = grid.getBoundingClientRect()
    const pointerX = event.clientX - gridRect.left
    const pointerY = event.clientY - gridRect.top
    grid.classList.add('is-magnifying')
    grid.querySelectorAll('article').forEach(item => {
      const centerX = item.offsetLeft + item.offsetWidth / 2
      const centerY = item.offsetTop + item.offsetHeight / 2
      const deltaX = centerX - pointerX
      const deltaY = centerY - pointerY
      const distance = Math.hypot(deltaX, deltaY)
      const influence = Math.max(0, 1 - distance / 220)
      const push = (1 - influence) * 16
      const directionX = distance > 1 ? deltaX / distance : 0
      const directionY = distance > 1 ? deltaY / distance : 0
      item.style.setProperty('--icon-scale', (1 + influence * .22).toFixed(3))
      item.style.setProperty('--dome-x', `${(directionX * push).toFixed(1)}px`)
      item.style.setProperty('--dome-y', `${(directionY * push).toFixed(1)}px`)
      item.style.zIndex = String(1 + Math.round(influence * 20))
    })
  }

  const resetIconMagnification = event => {
    const grid = event.currentTarget
    grid.classList.remove('is-magnifying')
    grid.querySelectorAll('article').forEach(item => {
      item.style.setProperty('--icon-scale', '1')
      item.style.setProperty('--dome-x', '0px')
      item.style.setProperty('--dome-y', '0px')
      item.style.zIndex = '1'
    })
  }

  return <section id="skills" className="skill-playground">
    <div className="skills-heading"><div><p className="eyebrow">02 / {eyebrow}</p><h2>{title}</h2></div><div className="skill-switch" aria-label="Ko‘nikmalar ko‘rinishi">{modes.map(([value, label, Icon]) => <button className={mode === value ? 'active' : ''} onClick={() => selectMode(value)} key={value}><Icon size={15} />{label}</button>)}</div></div>
    <div ref={stageRef} className={`skills-box mode-${mode}`} onPointerMove={trackPointer} onPointerLeave={() => { pointer.current.active = false }}>
      {mode === '3d' && <div className="cube-space">{skills.map((skill, index) => <Cube skill={skill} index={index} register={(position, element) => { cubeRefs.current[position] = element }} key={skill.name} />)}</div>}
      {mode === 'text' && <div className="skill-text-cloud">{skills.map((skill, index) => <button type="button" style={{ '--delay': `${index * 18}ms` }} onClick={() => setSelectedSkill(skill)} key={skill.name}>{skill.name}</button>)}</div>}
      {mode === 'icon' && <div className="skill-icon-grid" onPointerMove={magnifyIcons} onPointerLeave={resetIconMagnification}>{skills.map(skill => <article role="button" tabIndex="0" aria-label={`${skill.name} haqida ma’lumot`} onClick={() => setSelectedSkill(skill)} onKeyDown={event => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        setSelectedSkill(skill)
      }} key={skill.name}><SkillMark skill={skill} /><span>{skill.name}</span></article>)}</div>}
      {mode === '3d' && <label className="cube-size-control" onPointerMove={event => event.stopPropagation()}>
        <span>CUBE SIZE</span>
        <input type="range" min="56" max="150" step="2" value={cubeSize} onChange={event => {
          const value = Number(event.target.value)
          cubeSizeRef.current = value
          setCubeSize(value)
        }} />
        <output>{cubeSize}px</output>
      </label>}
    </div>
    {selectedSkill && <div className="skill-modal-backdrop" onMouseDown={event => event.target === event.currentTarget && setSelectedSkill(null)}>
      <div className="skill-modal" role="dialog" aria-modal="true" aria-labelledby="skill-modal-title">
        <button className="skill-modal-close" type="button" onClick={() => setSelectedSkill(null)} aria-label="Modalni yopish" autoFocus><X size={19} /></button>
        <div className="skill-modal-mark"><SkillMark skill={selectedSkill} /></div>
        <p className="eyebrow">SKILL / {skillDetails[selectedSkill.name]?.[0] || 'Technology'}</p>
        <h3 id="skill-modal-title">{selectedSkill.name}</h3>
        <p className="skill-modal-description">{skillDetails[selectedSkill.name]?.[1] || `${selectedSkill.name} bilan amaliy loyihalar yaratish va zamonaviy development jarayonlarida ishlash ko‘nikmasi.`}</p>
        <div className="skill-modal-footer"><span>AMALIY KO‘NIKMA</span><i /></div>
      </div>
    </div>}
  </section>
}

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const typeLabels = {
  website: 'WEB SITE',
  telegram: 'TELEGRAM BOT',
  planned: 'REJALASHTIRILGAN',
}

const circularOffset = (index, active, length) => {
  let offset = (index - active + length) % length
  if (offset > length / 2) offset -= length
  return offset
}

function ProjectArtwork({ item, index }) {
  return <div className="carousel-art">
    <span>{String(index + 1).padStart(2, '0')}</span>
    <b>{item.title.slice(0, 2)}</b>
    <img src={item.icon} alt="" />
  </div>
}

function ProjectCopy({ item, statusLabel }) {
  return <div className="carousel-card-copy">
    <div className="project-meta"><small>{item.category} {item.year ? `· ${item.year}` : ''}</small><em>{statusLabel(item.status)}</em></div>
    <h4>{item.title}</h4>
    <p>{item.description}</p>
    {item.technologies?.length > 0 && <div className="project-tech">{item.technologies.map(technology => <span key={technology}>{technology}</span>)}</div>}
  </div>
}

export default function ProjectCarousel({ items, statusLabel }) {
  const [active, setActive] = useState(0)
  const [view, setView] = useState('carousel')
  const [requestedView, setRequestedView] = useState('carousel')
  const [viewSwitching, setViewSwitching] = useState(false)
  const [filter, setFilter] = useState('all')
  const savedScrollPosition = useRef(null)
  const viewTimer = useRef(null)

  const filteredItems = useMemo(() => filter === 'all' ? items : items.filter(item => item.projectType === filter), [filter, items])
  const move = direction => setActive(current => (current + direction + items.length) % items.length)

  useEffect(() => {
    if (view !== 'carousel' || items.length < 2) return undefined
    const timer = window.setInterval(() => move(1), 2200)
    return () => window.clearInterval(timer)
  }, [view, items.length])

  useEffect(() => () => window.clearTimeout(viewTimer.current), [])

  useLayoutEffect(() => {
    if (savedScrollPosition.current === null) return undefined
    const scrollTop = savedScrollPosition.current
    window.scrollTo(0, scrollTop)
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo(0, scrollTop)
      savedScrollPosition.current = null
    })
    return () => window.cancelAnimationFrame(frame)
  }, [filter])

  const changeFilter = event => {
    savedScrollPosition.current = window.scrollY
    setFilter(event.target.value)
  }

  const changeView = nextView => {
    if (nextView === requestedView || viewSwitching) return
    setRequestedView(nextView)
    setViewSwitching(true)
    viewTimer.current = window.setTimeout(() => {
      setView(nextView)
      setViewSwitching(false)
    }, 240)
  }

  return <section className={`project-orbit view-${view} ${viewSwitching ? 'is-view-leaving' : ''}`}>
    <div className="project-viewbar">
      <label className={`project-filter ${requestedView === 'list' ? 'is-visible' : ''}`} aria-hidden={requestedView !== 'list'}>
        <span>SORT</span>
        <select value={filter} onChange={changeFilter} aria-label="Loyihalarni saralash" disabled={requestedView !== 'list'}>
          <option value="all">All</option>
          <option value="website">Web site</option>
          <option value="telegram">Telegram bot</option>
          <option value="planned">Planned</option>
        </select>
      </label>
      <div className="project-view-toggle" aria-label="Loyihalar ko‘rinishi">
        <button className={requestedView === 'carousel' ? 'active' : ''} aria-pressed={requestedView === 'carousel'} onClick={() => changeView('carousel')}>CAROUSEL</button>
        <button className={requestedView === 'list' ? 'active' : ''} aria-pressed={requestedView === 'list'} onClick={() => changeView('list')}>LIST</button>
      </div>
    </div>

    {view === 'carousel' ? <div className="project-view-panel carousel-view-panel">
      <div className="orbit-toolbar">
        <p><span>{String(active + 1).padStart(2, '0')}</span> / {String(items.length).padStart(2, '0')}</p>
        <div className="carousel-controls">
          <button onClick={() => move(-1)} aria-label="Oldingi loyiha"><ChevronLeft /></button>
          <button onClick={() => move(1)} aria-label="Keyingi loyiha"><ChevronRight /></button>
        </div>
      </div>

      <div className="project-orbit-stage">
        {items.map((item, index) => {
          const offset = circularOffset(index, active, items.length)
          const position = offset === 0 ? 'is-active' : offset === -1 ? 'is-left' : offset === 1 ? 'is-right' : 'is-hidden'
          return <article
            className={`orbit-card ${position}`}
            aria-hidden={Math.abs(offset) > 1}
            onClick={() => offset && Math.abs(offset) === 1 && setActive(index)}
            key={`${item.projectType}-${item.title}`}
          >
            <ProjectArtwork item={item} index={index} />
            <ProjectCopy item={item} statusLabel={statusLabel} />
            <span className={`project-type type-${item.projectType}`}>{typeLabels[item.projectType]}</span>
          </article>
        })}
      </div>

      <div className="orbit-dots" aria-label="Loyihani tanlash">
        {items.map((item, index) => <button className={index === active ? 'active' : ''} onClick={() => setActive(index)} aria-label={`${index + 1}: ${item.title}`} key={item.title} />)}
      </div>
    </div> : <div className="project-view-panel list-view-panel"><div className="project-list">
        {filteredItems.map(item => <article className="project-list-card" key={`${item.projectType}-${item.title}`}>
          <ProjectArtwork item={item} index={items.indexOf(item)} />
          <ProjectCopy item={item} statusLabel={statusLabel} />
          <span className={`project-type type-${item.projectType}`}>{typeLabels[item.projectType]}</span>
        </article>)}
        {filteredItems.length === 0 && <p className="project-list-empty">Bu turdagi loyiha topilmadi.</p>}
      </div></div>}
  </section>
}

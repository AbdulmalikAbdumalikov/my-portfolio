import { useMemo, useState } from 'react'

const typeLabels = { website: 'WEB SITE', telegram: 'TELEGRAM BOT', planned: 'REJALASHTIRILGAN' }

function ProjectArtwork({ item, index }) {
  return <div className="carousel-art"><span>{String(index + 1).padStart(2, '0')}</span><b>{item.title.slice(0, 2)}</b><img src={item.icon} alt="" /></div>
}

function ProjectCopy({ item, statusLabel }) {
  return <div className="carousel-card-copy"><div className="project-meta"><small>{item.category}{item.year ? ` · ${item.year}` : ''}</small><em>{statusLabel(item.status)}</em></div><h3>{item.title}</h3><p>{item.description}</p>{item.technologies?.length > 0 && <div className="project-tech">{item.technologies.map(technology => <span key={technology}>{technology}</span>)}</div>}</div>
}

export default function ProjectCarousel({ items, statusLabel }) {
  const [filter, setFilter] = useState('all')
  const filteredItems = useMemo(() => filter === 'all' ? items : items.filter(item => item.projectType === filter), [filter, items])
  const goToContact = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const onFutureCardKeyDown = event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      goToContact()
    }
  }

  return <section className="project-gallery project-directory">
    <div className="project-directory-bar"><p><span>{String(filteredItems.length).padStart(2, '0')}</span> / {String(items.length).padStart(2, '0')} PROJECTS</p><label className="project-filter is-visible"><span>SORT</span><select value={filter} onChange={event => setFilter(event.target.value)} aria-label="Loyihalarni saralash"><option value="all">All projects</option><option value="website">Web sites</option><option value="telegram">Telegram bots</option><option value="planned">Planned</option></select></label></div>
    <div className="project-list">{filteredItems.map(item => <article className="project-list-card" key={`${item.projectType}-${item.title}`}><ProjectArtwork item={item} index={items.indexOf(item)} /><ProjectCopy item={item} statusLabel={statusLabel} /><span className={`project-type type-${item.projectType}`}>{typeLabels[item.projectType]}</span></article>)}<article className="project-list-card project-list-card--future is-clickable" role="link" tabIndex="0" onClick={goToContact} onKeyDown={onFutureCardKeyDown} aria-label="Yangi loyiha uchun bog‘lanish bo‘limiga o‘tish"><div className="future-project-art" aria-hidden="true"><i /><i /><b>+</b><small>2026</small></div><div className="future-project-copy"><span>DEV / NEXT</span><h3>Yangiliklar qilishda davom etamiz.</h3><p>Yangi foydali loyihalar va tajribalar ustida ishlash davom etmoqda.</p><em>CONTACT →</em></div></article>{filteredItems.length === 0 && <p className="project-list-empty">Bu turdagi loyiha topilmadi.</p>}</div>
  </section>
}

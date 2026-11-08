import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, ExternalLink, X } from 'lucide-react'

const typeLabels = { website: 'WEB SITE', telegram: 'TELEGRAM BOT', planned: 'REJALASHTIRILGAN' }

function ProjectArtwork({ item, index }) {
  return <div className={`carousel-art${item.banner ? ' has-banner' : ''}`}>
    {item.banner && <img className="project-card-banner" src={item.banner} alt="" />}
    <span>{String(index + 1).padStart(2, '0')}</span><b>{item.title.slice(0, 2)}</b>{item.icon && <img className="project-card-icon" src={item.icon} alt="" />}
  </div>
}

function ProjectCopy({ item, statusLabel }) {
  return <div className="carousel-card-copy"><div className="project-meta"><small>{item.category}{item.year ? ` · ${item.year}` : ''}</small><em>{statusLabel(item.status)}</em></div><h3>{item.title}</h3><p>{item.description}</p>{item.technologies?.length > 0 && <div className="project-tech">{item.technologies.map(technology => <span key={technology}>{technology}</span>)}</div>}<span className="project-details-hint">Batafsil <ArrowUpRight size={14} /></span></div>
}

function ProjectModal({ item, statusLabel, onClose }) {
  useEffect(() => {
    const close = event => event.key === 'Escape' && onClose()
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', close)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', close) }
  }, [onClose])
  return <div className="project-modal-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <article className="project-modal" role="dialog" aria-modal="true" aria-label={`${item.title} loyiha tafsilotlari`}>
      <button className="project-modal-close" onClick={onClose} aria-label="Yopish"><X /></button>
      <div className={`project-modal-visual${item.banner ? ' has-banner' : ''}`}>
        {item.banner ? <img className="project-modal-banner" src={item.banner} alt={`${item.title} banneri`} /> : <div className="project-modal-banner-placeholder" />}
        {item.icon && <span className="project-modal-icon"><img src={item.icon} alt={`${item.title} ikonkasi`} /></span>}
      </div>
      <div className="project-modal-body">
        <div className="project-modal-meta"><span>{item.category}{item.year ? ` · ${item.year}` : ''}</span><em>{statusLabel(item.status)}</em></div>
        <h3>{item.title}</h3><p>{item.description}</p>
        {item.technologies?.length > 0 && <div className="project-modal-tags">{item.technologies.map(tag => <span key={tag}>{tag}</span>)}</div>}
        {item.link ? <a className="project-modal-link" href={item.link} target="_blank" rel="noreferrer">Loyihani ochish <ExternalLink size={17} /></a> : <div className="project-modal-link is-disabled">Link mavjud emas</div>}
      </div>
    </article>
  </div>
}

export default function ProjectCarousel({ items, statusLabel }) {
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const filteredItems = useMemo(() => filter === 'all' ? items : items.filter(item => item.projectType === filter), [filter, items])
  const goToContact = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const onFutureCardKeyDown = event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); goToContact() } }
  const openProject = (event, item) => { if (!event.target.closest('a')) setSelected(item) }
  const projectKey = (event, item) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(item) } }

  return <section className="project-gallery project-directory">
    <div className="project-directory-bar"><p><span>{String(filteredItems.length).padStart(2, '0')}</span> / {String(items.length).padStart(2, '0')} PROJECTS</p><label className="project-filter is-visible"><span>SORT</span><select value={filter} onChange={event => setFilter(event.target.value)} aria-label="Loyihalarni saralash"><option value="all">All projects</option><option value="website">Web sites</option><option value="telegram">Telegram bots</option><option value="planned">Planned</option></select></label></div>
    <div className="project-list">{filteredItems.map(item => <article className="project-list-card is-clickable" role="button" tabIndex="0" onClick={event => openProject(event, item)} onKeyDown={event => projectKey(event, item)} key={`${item.projectType}-${item.title}`}><ProjectArtwork item={item} index={items.indexOf(item)} /><ProjectCopy item={item} statusLabel={statusLabel} /><span className={`project-type type-${item.projectType}`}>{typeLabels[item.projectType]}</span></article>)}<article className="project-list-card project-list-card--future is-clickable" role="link" tabIndex="0" onClick={goToContact} onKeyDown={onFutureCardKeyDown} aria-label="Yangi loyiha uchun bog‘lanish bo‘limiga o‘tish"><div className="future-project-art" aria-hidden="true"><i /><i /><b>+</b><small>2026</small></div><div className="future-project-copy"><span>DEV / NEXT</span><h3>Yangiliklar qilishda davom etamiz.</h3><p>Yangi foydali loyihalar va tajribalar ustida ishlash davom etmoqda.</p><em>CONTACT →</em></div></article>{filteredItems.length === 0 && <p className="project-list-empty">Bu turdagi loyiha topilmadi.</p>}</div>
    {selected && <ProjectModal item={selected} statusLabel={statusLabel} onClose={() => setSelected(null)} />}
  </section>
}

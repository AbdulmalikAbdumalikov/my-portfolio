import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const photos = [
  { src: '/about/bdcbf095-c6cd-466c-b494-17d820b9e40d.png', position: 'center' },
  { src: '/about/MYrasm%20(1).jpg', position: 'center' },
  { src: '/about/MYrasm%20(1).png', position: 'center' },
  { src: '/about/MYrasm%20(2).jpg', position: 'center' },
  { src: '/about/MYrasm%20(4).jpg', position: 'center' },
]

export default function AboutCarousel() {
  const [active, setActive] = useState(0)
  const touchStartX = useRef(null)

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const timer = setInterval(() => setActive(index => (index + 1) % photos.length), 4800)
    return () => clearInterval(timer)
  }, [])

  const move = direction => setActive(index => (index + direction + photos.length) % photos.length)

  return <div className="about-carousel" data-tilt>
    <div className="about-photo-stack" onTouchStart={event => { touchStartX.current = event.changedTouches[0].clientX }} onTouchEnd={event => {
      const start = touchStartX.current
      const distance = start === null ? 0 : event.changedTouches[0].clientX - start
      touchStartX.current = null
      if (Math.abs(distance) < 40) return
      move(distance < 0 ? 1 : -1)
    }}>
      {photos.map((photo, index) => <div
        className={`photo-frame ${index === active ? 'active' : ''}`}
        style={{ '--photo': `url("${photo.src}")` }}
        key={photo.src}
      ><img
          src={photo.src}
          style={{ objectPosition: photo.position }}
          alt={index === active ? `Abdulmalik — portfolio rasmi ${index + 1}` : ''}
        /></div>)}
    </div>
    <div className="photo-footer">
      <div className="photo-controls">
        <button onClick={() => move(-1)} aria-label="Oldingi rasm"><ChevronLeft /></button>
        <div className="photo-dots">{photos.map((photo, index) => <button className={index === active ? 'active' : ''} onClick={() => setActive(index)} aria-label={`${index + 1}-rasm`} key={photo.src} />)}</div>
        <button onClick={() => move(1)} aria-label="Keyingi rasm"><ChevronRight /></button>
      </div>
    </div>
  </div>
}

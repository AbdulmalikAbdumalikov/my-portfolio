export default function InteractiveLamp({ mode }) {
  return <div className={`reading-lamp ${mode === 'on' ? 'is-on' : 'is-off'}`} aria-hidden="true">
    <span className="lamp-cable" />
    <span className="lamp-shade">
      <i className="lamp-bulb" />
    </span>
    <span className="lamp-beam" />
  </div>
}

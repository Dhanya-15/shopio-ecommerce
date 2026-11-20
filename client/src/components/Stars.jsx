export default function Stars({ value = 0 }) {
  const pct = (Math.max(0, Math.min(5, value)) / 5) * 100;
  return (
    <span className="stars" style={{ '--pct': `${pct}%` }} role="img" aria-label={`${value} out of 5 stars`}>★★★★★</span>
  );
}

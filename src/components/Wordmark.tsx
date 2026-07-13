/**
 * KAYUMANGGI — SVG wordmark.
 * Carbone / Le Bernardin logic: no icon mark, all-caps, wide tracking,
 * hairline high-contrast serif. Scales cleanly and inherits color via
 * `fill="currentColor"`.
 *
 * `lockup` is the full footer treatment: brushed-gold letterforms, a hairline
 * rule broken by a diamond, then the city line. Everywhere else (nav, hero) the
 * mark stays plain bone — the gold is a single deliberate moment, not a texture.
 *
 * Note on the old `rules` prop (removed): it drew two rects at y=60 meant to
 * flank the name, but at 104px with 0.26em tracking the text is wide enough to
 * run straight through them — they read as a strike-through. A rule can only
 * live BELOW the wordmark, where nothing can collide with it.
 */
type Props = {
  className?: string;
  /** Full footer lockup: gold fill + ornament rule + city line. */
  lockup?: boolean;
  title?: string;
};

const GOLD = "kayumanggi-gold";

export default function Wordmark({
  className,
  lockup = false,
  title = "Kayumanggi",
}: Props) {
  return (
    <svg
      viewBox="0 0 1000 220"
      role="img"
      aria-label={title}
      className={className}
      style={{ display: "block", width: "100%", height: "auto" }}
      fill="currentColor"
    >
      {lockup && (
        <defs>
          {/* Gradient spans the text's own bounding box (objectBoundingBox is
              the default), so the sheen lands across the letterforms rather
              than across the whole 220-unit canvas. The bottom stop is #ab8140
              — the deepest gold that still clears WCAG AA (5.36:1) on espresso;
              anything darker gives more "metal" but fails as an image of text. */}
          <linearGradient id={GOLD} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0e3c8" />
            <stop offset="34%" stopColor="#e0b978" />
            <stop offset="52%" stopColor="#c79a54" />
            <stop offset="70%" stopColor="#dcb478" />
            <stop offset="100%" stopColor="#ab8140" />
          </linearGradient>
        </defs>
      )}

      <text
        x="500"
        y="118"
        textAnchor="middle"
        fill={lockup ? `url(#${GOLD})` : undefined}
        style={{
          fontFamily: "var(--font-display), Georgia, serif",
          fontWeight: 500,
          fontSize: "104px",
          letterSpacing: "0.26em",
        }}
        /* nudge: letterspacing pushes the block right; recenter optically */
        dx="13"
      >
        KAYUMANGGI
      </text>

      {lockup && (
        <>
          {/* hairline rule, broken by a diamond — sits below the name, so it
              can never collide with the letterforms the way the old one did */}
          <g fill="var(--brass)">
            <rect x="300" y="150.5" width="170" height="1" opacity="0.55" />
            <rect x="530" y="150.5" width="170" height="1" opacity="0.55" />
            <path d="M500 143l8 8-8 8-8-8z" />
          </g>

          <text
            x="500"
            y="192"
            textAnchor="middle"
            style={{
              fontFamily: "var(--font-body), sans-serif",
              fontWeight: 500,
              fontSize: "20px",
              letterSpacing: "0.5em",
            }}
            dx="10"
            opacity="0.7"
          >
            BONIFACIO GLOBAL CITY
          </text>
        </>
      )}
    </svg>
  );
}

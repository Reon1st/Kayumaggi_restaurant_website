/* Inline SVG icons — consistent 1.5px stroke, currentColor. No icon-font deps. */
type I = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

export const ArrowDown = ({ className }: I) => (
  <svg {...base} className={className}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
);

export const ArrowRight = ({ className }: I) => (
  <svg {...base} className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const Menu = ({ className }: I) => (
  <svg {...base} className={className}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const Close = ({ className }: I) => (
  <svg {...base} className={className}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const Clock = ({ className }: I) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const Pin = ({ className }: I) => (
  <svg {...base} className={className}>
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);

export const Phone = ({ className }: I) => (
  <svg {...base} className={className}>
    <path d="M4.5 5.5c0 8 6 14 14 14 .9 0 1.7-.6 1.9-1.5l.4-1.8a1.4 1.4 0 0 0-.8-1.6l-2.7-1.2a1.4 1.4 0 0 0-1.6.4l-.8 1c-1.9-1-3.5-2.6-4.5-4.5l1-.8a1.4 1.4 0 0 0 .4-1.6L10.4 4.9a1.4 1.4 0 0 0-1.6-.8L7 4.5c-.9.2-1.5 1-1.5 1.9Z" />
  </svg>
);

export const Instagram = ({ className }: I) => (
  <svg {...base} className={className}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const Facebook = ({ className }: I) => (
  <svg {...base} className={className}>
    <path d="M14.5 8.5h2V5.5h-2c-1.9 0-3 1.3-3 3.2V11H9.5v3H11.5v6H14v-6h2.2l.3-3H14v-1.9c0-.4.2-.6.5-.6Z" />
  </svg>
);

export const Check = ({ className }: I) => (
  <svg {...base} className={className}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/**
 * Destination — a stop on the voyage. Renders the route node (a brass dot that
 * sits on the itinerary rail), the stop number, city, coordinates, and the
 * "kitchen" it represents. Used as each section header in the Four Kitchens menu.
 */
type Props = {
  stop: string;
  city: string;
  coords: string;
  kitchen: string;
};

export default function Destination({ stop, city, coords, kitchen }: Props) {
  return (
    <div className="reveal relative">
      {/* node on the rail (desktop only; rail is hidden on mobile) */}
      <span
        aria-hidden
        className="absolute -left-8 top-3 hidden h-3 w-3 -translate-x-1/2 rounded-full bg-[var(--brass)] ring-4 ring-[var(--charcoal)] lg:block"
      />
      <p className="eyebrow eyebrow-dim tnum">{stop}</p>
      <h3 className="mt-2 font-display text-4xl leading-none text-[var(--bone)]">{city}</h3>
      <p className="tnum mt-2 text-[0.74rem] tracking-[0.22em] text-[var(--brass)]">{coords}</p>
      <p className="mt-3 text-[0.72rem] uppercase tracking-[0.24em] text-[var(--bone-dim)]">
        {kitchen}
      </p>
    </div>
  );
}

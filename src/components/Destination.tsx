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
      {/* Node on the rail (desktop only; rail is hidden on mobile).
          Ignites when the progress line reaches it. Centering lives in the
          .rail-node CSS, not a Tailwind translate class, so the lit state can
          add a scale() without the two transforms clobbering each other. */}
      <span aria-hidden data-rail-node className="rail-node absolute -left-8 top-3 hidden h-[7px] w-[7px] rounded-full lg:block" />
      <p className="eyebrow eyebrow-dim tnum">{stop}</p>
      <h3 className="mt-2 font-display text-4xl leading-none text-[var(--bone)]">{city}</h3>
      <p className="tnum mt-2 text-[0.74rem] tracking-[0.22em] text-[var(--brass)]">{coords}</p>
      <p className="mt-3 text-[0.72rem] uppercase tracking-[0.24em] text-[var(--bone-dim)]">
        {kitchen}
      </p>
    </div>
  );
}

"use client";

import Image from "next/image";

export type SliderImage = {
  src: string;
  alt: string;
  label?: string;
};

type Props = {
  images: SliderImage[];
  /** Seconds for one full loop. Higher = slower. @default 48 */
  speed?: number;
};

/**
 * Infinite auto-scrolling image marquee.
 *
 * The set is duplicated once and the track is translated exactly -50%, which is
 * only seamless if every item contributes the same width — so items use a right
 * MARGIN rather than a flex `gap`. (With `gap`, half the track width is off by
 * half a gap and the loop visibly stutters each cycle.)
 *
 * Pauses on hover, and stops entirely under `prefers-reduced-motion`, where the
 * strip becomes manually scrollable instead. Styles live in globals.css.
 */
export default function ImageAutoSlider({ images, speed = 48 }: Props) {
  const loop = [...images, ...images];

  return (
    <div className="marquee">
      <div
        className="marquee__track flex w-max"
        style={{ ["--marquee-speed" as string]: `${speed}s` }}
      >
        {loop.map((img, i) => {
          const isDuplicate = i >= images.length;
          return (
            <figure
              key={i}
              // the duplicated half is decorative — hide it from screen readers
              aria-hidden={isDuplicate}
              className="group relative mr-3 aspect-video h-44 shrink-0 overflow-hidden rounded-sm sm:mr-4 sm:h-52 lg:h-60"
            >
              <Image
                src={img.src}
                alt={isDuplicate ? "" : img.alt}
                fill
                sizes="(max-width: 640px) 70vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
              {img.label && (
                <>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <figcaption className="plate__label">{img.label}</figcaption>
                </>
              )}
            </figure>
          );
        })}
      </div>
    </div>
  );
}

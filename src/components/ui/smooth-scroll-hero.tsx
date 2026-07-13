"use client";
import * as React from "react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface SmoothScrollHeroProps {
  /**
   * Scroll distance (px) over which the reveal plays — DESKTOP ONLY.
   * On phones the distance is 70svh (see `.ssh-wrap` in globals.css): a fixed px
   * value there is ~2.4 screens of thumb-scrolling before any content appears.
   * @default 1400
   */
  scrollHeight?: number;
  /** Video source. When set, an autoplaying muted loop is used as the media. */
  video?: string;
  /** Poster / first frame shown before the video loads (and under reduced motion). */
  poster?: string;
  /** Fallback background image when no `video` is provided. */
  desktopImage?: string;
  /** Initial inset of the reveal window, per side (%). @default 25 */
  initialClipPercentage?: number;
  /** Content rendered centered over the media (e.g. a wordmark), fades on scroll. */
  children?: React.ReactNode;
}

/**
 * Smooth-scroll hero: a video (or image) revealed through a clip window that
 * expands to fullscreen while the media zooms out and the overlay recedes — all
 * scrubbed to scroll on GSAP/ScrollTrigger. Under `prefers-reduced-motion` the
 * media is shown full and static, the video stays paused on its poster, and the
 * overlay stays fully visible. Initial clip is applied pre-paint via the global
 * `.anim-ready .ssh-media` rule (motion-only), so there is no first-paint flash.
 */
export default function SmoothScrollHero({
  scrollHeight = 1400,
  video,
  poster,
  desktopImage,
  initialClipPercentage = 25,
  children,
}: SmoothScrollHeroProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const sticky = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlay = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        const clip = { v: initialClipPercentage };
        const applyClip = () => {
          if (media.current)
            media.current.style.clipPath = `inset(${clip.v}% round 3px)`;
        };
        applyClip();
        // Programmatic play (rather than the autoplay attribute) so reduced
        // motion can keep it paused on the poster.
        videoRef.current?.play().catch(() => {});

        const items = overlay.current?.querySelectorAll<HTMLElement>("[data-hero-item]");
        const cue = overlay.current?.querySelector<HTMLElement>("[data-hero-cue]");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapper.current,
            start: "top top",
            // The scroll distance is whatever CSS left over after the sticky
            // pane — so it follows the responsive height instead of a constant.
            // Re-measured on resize/orientation change.
            end: () =>
              `+=${(wrapper.current?.offsetHeight ?? 0) - (sticky.current?.offsetHeight ?? 0)}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        // Video window opens + zooms out over the first ~two-thirds of the scroll.
        tl.to(clip, { v: 0, duration: 0.7, ease: "none", onUpdate: applyClip }, 0);
        if (videoRef.current)
          tl.fromTo(videoRef.current, { scale: 1.25 }, { scale: 1, duration: 0.7, ease: "none" }, 0);
        // The "scroll" cue fades out early, once the reveal is underway…
        if (cue) tl.to(cue, { autoAlpha: 0, duration: 0.18, ease: "none" }, 0);
        // …and the hero contents compose in, staggered, fully arrived by the end.
        // autoAlpha (opacity + visibility) keeps hidden items unclickable.
        if (items && items.length)
          tl.fromTo(
            items,
            { autoAlpha: 0, y: 34 },
            { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.3, ease: "none" },
            0.4
          );
      }, wrapper);
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, [scrollHeight, initialClipPercentage]);

  return (
    <div
      ref={wrapper}
      style={{ ["--ssh-scroll-desktop" as string]: `${scrollHeight}px` }}
      className="ssh-wrap relative w-full"
    >
      <div ref={sticky} className="sticky top-0 h-[100svh] w-full overflow-hidden bg-black">
        <div ref={media} className="ssh-media absolute inset-0">
          {video ? (
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              src={video}
              poster={poster}
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden
            />
          ) : (
            <div
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: desktopImage ? `url(${desktopImage})` : undefined }}
            />
          )}
          {/* legibility: theme-tinted vertical gradient (melts into the next
              section at the bottom) + a soft centered darken behind the text */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--espresso)]/70 via-black/20 to-[var(--espresso)]" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 78% 56% at 50% 46%, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0) 70%)",
            }}
          />
        </div>

        <div ref={overlay} className="absolute inset-0 z-20 flex items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}

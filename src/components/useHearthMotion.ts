"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Central motion for the page. Everything is wrapped in gsap.matchMedia, so
 * `prefers-reduced-motion: reduce` yields a completely static, fully-visible
 * page. Hidden initial states live in CSS under `.anim-ready` (added pre-paint
 * in layout only when motion is allowed) — so there is no first-paint flash,
 * and no-JS / reduced-motion users always see fully-rendered content.
 */
export function useHearthMotion(scope: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    const EASE = "power3.out";

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        // ---------- Generic scroll reveals ----------
        gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
          gsap.to(el, {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: EASE,
            scrollTrigger: { trigger: el, start: "top 86%" },
          });
        });

        // ---------- Masked line reveals (headings rising in sequence) ----------
        gsap.utils.toArray<HTMLElement>(".reveal-mask").forEach((el) => {
          gsap.set(el.children, { y: 26 });
          gsap.to(el.children, {
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: EASE,
            stagger: 0.12,
            scrollTrigger: { trigger: el, start: "top 84%" },
          });
        });

        // ---------- Staggered groups (menu rows, gallery) ----------
        gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((group) => {
          const items = group.querySelectorAll("[data-stagger-item]");
          gsap.set(items, { y: 34 });
          gsap.to(items, {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: EASE,
            stagger: 0.08,
            scrollTrigger: { trigger: group, start: "top 82%" },
          });
        });

        // ---------- Parallax ----------
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const amount = Number(el.dataset.parallax || "12");
          gsap.fromTo(
            el,
            { yPercent: -amount },
            {
              yPercent: amount,
              ease: "none",
              scrollTrigger: {
                trigger: el.closest("[data-parallax-scope]") || el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        });

        // ---------- Hairline rules drawing in ----------
        gsap.utils.toArray<HTMLElement>("[data-draw]").forEach((el) => {
          gsap.to(el, {
            scaleX: 1,
            duration: 1.2,
            ease: EASE,
            scrollTrigger: { trigger: el, start: "top 90%" },
          });
        });

        // ---------- The route rail: a line that travels the itinerary ----------
        // The line's fill is the single source of truth. A node lights when the
        // fill passes ITS position along the rail — not on a ScrollTrigger of its
        // own, which would fire when the *node* hits a viewport line rather than
        // when the *tip* arrives, and drift out of sync with the line it's meant
        // to be connected to.
        const rail = document.querySelector<HTMLElement>("[data-rail]");
        const line = rail?.querySelector<HTMLElement>("[data-rail-progress]");
        const head = rail?.querySelector<HTMLElement>("[data-rail-head]");
        const nodes = gsap.utils.toArray<HTMLElement>("[data-rail-node]");

        if (rail && line && head && nodes.length) {
          // Each node's position along the rail, 0–1. Re-measured on every
          // ScrollTrigger refresh (resize, font swap, image load) so the stops
          // keep matching the line instead of trusting a stale first read.
          let stops: number[] = [];
          const measure = () => {
            const railTop = rail.getBoundingClientRect().top + window.scrollY;
            const railH = rail.offsetHeight || 1;
            stops = nodes.map((n) => {
              const r = n.getBoundingClientRect();
              const center = r.top + window.scrollY + r.height / 2;
              return (center - railTop) / railH;
            });
          };

          gsap.set(line, { scaleY: 0, transformOrigin: "top center" });

          // The route only ever advances. A scrubbed tween can't express that —
          // scrub maps scroll position onto timeline position, so scrolling up
          // necessarily rewinds it, and the voyage un-travels itself. Instead we
          // keep our own high-water mark and never let it fall: `travelled` is
          // monotonic, so a stop that has been reached stays reached.
          let travelled = 0;

          // quickTo gives the same eased lag the old `scrub: 0.6` did — the line
          // settles after the scroll rather than welding to it — but driven by a
          // value we control rather than by scroll direction.
          const drawTo = gsap.quickTo(line, "scaleY", { duration: 0.5, ease: "power3" });
          const moveTo = gsap.quickTo(head, "y", { duration: 0.5, ease: "power3" });

          const render = (p: number) => {
            drawTo(p);
            moveTo(p * rail.offsetHeight);
            // Struck on departure, gone on arrival — and it stays gone, because
            // this is driven by the latched value, not by raw scroll.
            head.classList.toggle("is-travelling", p > 0.005 && p < 0.995);
            // add only, never remove: a stop that has been reached stays reached
            for (let i = 0; i < nodes.length; i++) {
              if (p >= stops[i]) nodes[i].classList.add("is-lit");
            }
          };

          ScrollTrigger.create({
            trigger: rail,
            start: "top 72%",
            end: "bottom 72%",
            invalidateOnRefresh: true,
            onRefresh: (self) => {
              measure();
              // Reloading *below* the section leaves progress at 1 with no scroll
              // event to follow, so onUpdate never fires. Seed from the refresh or
              // the rail sits undrawn above you.
              if (self.progress > travelled) {
                travelled = self.progress;
                render(travelled);
              }
            },
            onUpdate: (self) => {
              if (self.progress <= travelled) return; // scrolling back up: hold
              travelled = self.progress;
              render(travelled);
            },
          });
        }
      }, scope);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, [scope]);
}

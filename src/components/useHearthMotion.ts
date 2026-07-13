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
      }, scope);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, [scope]);
}

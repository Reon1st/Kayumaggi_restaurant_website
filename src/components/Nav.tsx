"use client";

import { useEffect, useRef, useState } from "react";
import Wordmark from "./Wordmark";
import { Menu, Close } from "./icons";

const LINKS = [
  { href: "#story", label: "Story" },
  { href: "#menu", label: "Menu" },
  { href: "#gallery", label: "Gallery" },
  { href: "#visit", label: "Visit" },
];

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll + close on Escape while the mobile sheet is open
  useEffect(() => {
    if (!open) return;
    const btn = toggle.current; // captured now; the ref may be null by cleanup
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      // `inert` blurs whatever was focused inside the sheet, which would dump
      // focus on <body> and send the next Tab back to the top of the document.
      // Hand it back to the button that opened it.
      btn?.focus();
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          solid
            ? "bg-[var(--espresso)]/85 backdrop-blur-md border-b border-[var(--line)]"
            : "bg-transparent"
        }`}
      >
      <nav className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <a
          href="#top"
          aria-label="Kayumanggi — home"
          className="wordmark-link w-[168px] text-[var(--bone)] sm:w-[196px]"
        >
          {/* compact wordmark: hide tagline in the bar */}
          <div className="translate-y-[2px]">
            <Wordmark />
          </div>
        </a>

        <ul className="hidden items-center gap-9 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="link-underline text-[0.7rem] font-medium uppercase tracking-[0.24em] text-[var(--bone-dim)] transition-colors hover:text-[var(--bone)]"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a href="#reserve" className="btn btn-primary text-[0.68rem]">
              Reserve
            </a>
          </li>
        </ul>

        <button
          ref={toggle}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="flex h-11 w-11 items-center justify-center text-[var(--bone)] md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        </nav>
      </header>

      {/* Mobile sheet — deliberately a SIBLING of <header>, not a child.
          Once scrolled, the header gets `backdrop-blur`, and backdrop-filter
          creates a containing block for fixed-position descendants. Nested in
          there, this sheet's `inset-0` would resolve against the 74px header
          box instead of the viewport — collapsing it into a strip under the
          navbar. Kept outside, `fixed` means fixed to the viewport again.

          `inert` (not aria-hidden + pointer-events-none) is what makes the closed
          sheet truly gone: it stays laid out for the slide transition, but is
          removed from the tab order AND the a11y tree. Translating it offscreen
          alone leaves its links focusable — keyboard users tab into nothing. */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className="fixed inset-0 z-[60] md:hidden"
        inert={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-[var(--espresso-deep)]/80 backdrop-blur-sm transition-opacity duration-400 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute inset-y-0 right-0 flex w-[82%] max-w-sm flex-col bg-[var(--charcoal)] px-8 pt-6 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="flex h-11 w-11 items-center justify-center text-[var(--bone)]"
            >
              <Close className="h-6 w-6" />
            </button>
          </div>
          <ul className="mt-6 flex flex-col gap-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 font-display text-3xl text-[var(--bone)]"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#reserve"
            onClick={() => setOpen(false)}
            className="btn btn-primary mt-8 w-full"
          >
            Reserve a table
          </a>
          <p className="mt-auto pb-8 pt-10 text-[0.7rem] uppercase tracking-[0.24em] text-[var(--bone-faint)]">
            Dinner · Tue&ndash;Sun · 6&ndash;11pm
          </p>
        </div>
      </div>
    </>
  );
}

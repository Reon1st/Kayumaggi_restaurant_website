"use client";

import { useRef } from "react";
import Image from "next/image";
import Nav from "@/components/Nav";
import Wordmark from "@/components/Wordmark";
import Destination from "@/components/Destination";
import ReserveForm from "@/components/ReserveForm";
import SmoothScrollHero from "@/components/ui/smooth-scroll-hero";
import ImageAutoSlider from "@/components/ui/image-auto-slider";
import { useHearthMotion } from "@/components/useHearthMotion";
import { ArrowDown, ArrowRight, Clock, Pin, Phone } from "@/components/icons";

export default function Home() {
  const root = useRef<HTMLElement>(null);
  useHearthMotion(root);

  return (
    <main ref={root} id="top" className="relative">
      <Nav />

      {/* ============================ HERO ============================ */}
      <SmoothScrollHero video="/hero-boeuf.mp4" poster="/hero-poster.jpg" scrollHeight={1600}>
        <div className="mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
          <p data-hero-item className="eyebrow tnum mb-8">
            14°35′N · 121°00′E · Bonifacio Global City
          </p>

          <h1 data-hero-item className="m-0 w-full max-w-3xl text-[var(--bone)]">
            <Wordmark title="Kayumanggi — a Filipino culinary voyage through Tokyo, Paris and Rome, in BGC Manila" />
          </h1>

          <p
            data-hero-item
            className="mt-9 max-w-xl font-display text-2xl font-light leading-snug text-[var(--bone-dim)] sm:text-[1.7rem]"
          >
            Filipino soul
            <span className="mx-2 text-[var(--brass)]">·</span>
            a passport for the palate
          </p>

          <div
            data-hero-item
            className="pointer-events-auto mt-12 flex flex-col items-center gap-4 sm:flex-row"
          >
            <a href="#reserve" className="btn btn-primary">
              Reserve a table
            </a>
            <a href="#menu" className="btn btn-ghost">
              Explore the menu
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div
          data-hero-cue
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[var(--bone-faint)]"
        >
          <span className="text-[0.6rem] uppercase tracking-[0.3em]">Scroll</span>
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </div>
      </SmoothScrollHero>

      {/* ============================ STORY ============================ */}
      <section id="story" className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-36">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div data-parallax-scope className="relative">
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm">
              {/* Frame matches the source 3:4 exactly. The inner layer is a touch
                  taller than the frame purely to give the parallax room to drift. */}
              <div data-parallax="6" className="absolute inset-x-0 -top-[9%] h-[118%]">
                <Image
                  src="/story-room-v2.jpg"
                  alt="A candlelit table set for dinner in an empty dining room, a brass sconce glowing on the wall above"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="plate__label">The dining room · nightly service</span>
            </div>
            <div className="absolute -bottom-6 -right-4 hidden rounded-sm border border-[var(--line-strong)] bg-[var(--espresso)] px-6 py-5 sm:block">
              <p className="font-display text-4xl text-[var(--brass)]">4</p>
              <p className="mt-1 text-[0.7rem] uppercase tracking-[0.24em] text-[var(--bone-faint)]">
                kitchens · one table
              </p>
            </div>
          </div>

          <div>
            <p className="eyebrow reveal">Ang Paglalakbay · The Voyage</p>
            <h2 className="reveal-mask mt-6 font-display text-[2.6rem] leading-[1.05] text-[var(--bone)] sm:text-6xl">
              <span className="block">One soul,</span>
              <span className="block">four kitchens.</span>
            </h2>
            <div className="mt-8 space-y-5 text-[1.02rem] leading-relaxed text-[var(--bone-dim)]">
              <p className="reveal">
                <span className="font-display text-2xl text-[var(--brass)]">Kayumanggi</span>{" "}
                is still the old word for the warm brown at the heart of every
                Filipino table. But our chef left that table young — to stage in
                Tokyo, to sweat in a Paris brigade, to roll pasta by hand in Rome.
              </p>
              <p className="reveal">
                So we set an honest table in each city he loved — the raw bar of
                Tokyo, a Burgundy braise in Paris, a Roman trattoria — with Manila
                as the home you leave and come back to. Nothing is fused into
                something it isn’t; each plate is simply, faithfully itself. You sit
                down in BGC; you spend the evening somewhere else.
              </p>
            </div>

            <div data-stagger className="mt-10 grid grid-cols-3 gap-6 border-t border-[var(--line)] pt-8">
              {[
                ["Manila, always", "the base note in every plate"],
                ["Four techniques", "Tokyo, Paris, Roma — first-hand"],
                ["One table", "a single voyage, seven courses"],
              ].map(([t, d]) => (
                <div data-stagger-item key={t}>
                  <p className="font-display text-xl text-[var(--bone)]">{t}</p>
                  <p className="mt-1.5 text-[0.82rem] leading-snug text-[var(--bone-faint)]">{d}</p>
                </div>
              ))}
            </div>

            <p className="reveal mt-10 font-display text-2xl italic text-[var(--bone-dim)]">
              “I left to learn the world’s kitchens. I came home to cook them in Tagalog.”
            </p>
            <p className="reveal mt-3 text-[0.72rem] uppercase tracking-[0.26em] text-[var(--brass)]">
              Chef Amihan del Rosario
            </p>
          </div>
        </div>
      </section>

      {/* ============================ MENU ============================ */}
      <section id="menu" className="relative bg-[var(--charcoal)] py-28 sm:py-36">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="text-center">
            <p className="eyebrow reveal">The Four Kitchens · Ang Hapag</p>
            <div className="reveal-mask mt-5">
              <h2 className="font-display text-5xl text-[var(--bone)] sm:text-7xl">The Voyage</h2>
            </div>
            <p className="reveal mx-auto mt-6 max-w-xl text-[var(--bone-dim)]">
              Four stops in one evening. A true table in every city — Manila to
              begin, then the raw bar of Tokyo, a Paris bistro, a Roman trattoria.
              Order by the plate, or take the whole route as our tasting.
            </p>
          </div>

          {/* Tasting highlight */}
          <div className="reveal mx-auto mt-14 max-w-3xl rounded-sm border border-[var(--brass)]/40 bg-[var(--espresso)] p-8 text-center sm:p-10">
            <p className="eyebrow">The Grand Tour · Tasting Menu</p>
            <p className="mt-4 font-display text-3xl text-[var(--bone)] sm:text-4xl">
              Seven courses, four cities, one long evening
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-8">
              <p className="tnum font-display text-2xl text-[var(--brass)]">₱5,400</p>
              <span className="hidden h-4 w-px bg-[var(--line-strong)] sm:block" />
              <p className="text-[0.82rem] uppercase tracking-[0.2em] text-[var(--bone-faint)]">
                Wine pairing <span className="tnum text-[var(--bone-dim)]">+₱2,900</span>
              </p>
            </div>
          </div>

          {/* The itinerary — four stops, threaded by the route rail */}
          <div className="relative mt-24">
            {/* route rail (desktop) */}
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-6 left-6 top-3 hidden border-l border-dotted border-[var(--brass)]/35 lg:block"
            />
            <div className="space-y-20">
              {MENU.map((city) => (
                <div
                  key={city.city}
                  data-stagger
                  className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr] lg:gap-16 lg:pl-14"
                >
                  <Destination
                    stop={city.stop}
                    city={city.city}
                    coords={city.coords}
                    kitchen={city.kitchen}
                  />
                  <ul className="grid grid-cols-1 gap-x-12 gap-y-7 sm:grid-cols-2">
                    {city.dishes.map((d) => (
                      <li data-stagger-item key={d.name}>
                        <div className="leader">
                          <span className="font-display text-xl text-[var(--bone)]">{d.name}</span>
                          <span className="leader__fill" />
                          <span className="tnum font-display text-lg text-[var(--brass)]">{d.price}</span>
                        </div>
                        <p className="mt-1.5 text-[0.86rem] leading-relaxed text-[var(--bone-faint)]">
                          {d.desc}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <p className="reveal mt-20 text-center text-[0.78rem] text-[var(--bone-faint)]">
            Prices in Philippine pesos. A 10% service charge is added for parties of
            six or more. Please tell us of any allergies — our kitchen will adjust.
          </p>
        </div>
      </section>

      {/* ============================ GALLERY ============================ */}
      <section id="gallery" className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-36">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow reveal">The Room &amp; The Route</p>
            <div className="reveal-mask mt-5">
              <h2 className="font-display text-5xl text-[var(--bone)] sm:text-6xl">
                Lit low, a world away
              </h2>
            </div>
          </div>
          <p className="reveal max-w-xs text-[0.9rem] leading-relaxed text-[var(--bone-dim)]">
            Forty seats, an open kitchen, and a night that crosses four borders.
          </p>
        </div>

        <div data-stagger className="space-y-3 sm:space-y-4">
          {/* the room — full-width feature */}
          <div
            data-stagger-item
            className="group relative aspect-video overflow-hidden rounded-sm"
          >
            <Image
              src="/gallery-dining-room-v2.jpg"
              alt="A long row of leather booths lit by low brass pendants and candlelight, empty before service"
              fill
              /* section is max-w-7xl (1280px) with padding — not full viewport */
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <span className="plate__label">The dining room</span>
          </div>

          {/* the plates — an endless, slow-moving strip */}
          <div data-stagger-item>
            <ImageAutoSlider images={GALLERY} speed={52} />
          </div>
        </div>
      </section>

      {/* ============================ RESERVE / VISIT ============================ */}
      <section
        id="visit"
        className="relative border-t border-[var(--line)] bg-[var(--espresso-deep)] py-28 sm:py-36"
      >
        <div
          id="reserve"
          className="mx-auto grid max-w-7xl grid-cols-1 gap-14 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20"
        >
          {/* info */}
          <div>
            <p className="eyebrow reveal">Reservations · Tuloy Po Kayo</p>
            <h2 className="reveal-mask mt-5 font-display text-5xl leading-[1.03] sm:text-6xl">
              <span className="block text-[var(--bone)]">Reserve your</span>
              <span className="block text-[var(--brass)]">passage</span>
            </h2>
            <p className="reveal mt-7 max-w-md text-[var(--bone-dim)]">
              We set a limited number of tables each night so the voyage stays
              unhurried. Request below and our maître d’ will confirm by email.
            </p>

            <dl className="reveal mt-12 space-y-7">
              <InfoRow icon={<Clock className="h-5 w-5" />} label="Hours">
                Tuesday&ndash;Sunday · 6:00&ndash;11:00 PM
                <br />
                <span className="text-[var(--bone-faint)]">Closed Mondays</span>
              </InfoRow>
              <InfoRow icon={<Pin className="h-5 w-5" />} label="Where">
                7th Avenue cor. 30th Street
                <br />
                Bonifacio Global City, Taguig, Metro Manila
              </InfoRow>
              <InfoRow icon={<Phone className="h-5 w-5" />} label="Call">
                <a href="tel:+63285550170" className="link-underline">
                  +63 2 8555 0170
                </a>
              </InfoRow>
            </dl>
          </div>

          {/* form */}
          <div className="reveal">
            <ReserveForm />
          </div>
        </div>
      </section>

      {/* ============================ FOOTER ============================ */}
      <footer className="border-t border-[var(--line)] bg-[var(--espresso)] pt-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center text-[var(--bone)]">
            <Wordmark lockup />
          </div>

          {/* No social icons: the brand is fictional, so they had nowhere to go.
              A dead link a reviewer can click is worse than one less affordance. */}
          <div className="mt-16 border-t border-[var(--line)] py-10">
            <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {["Story", "Menu", "Gallery", "Visit"].map((l) => (
                <a
                  key={l}
                  href={`#${l.toLowerCase()}`}
                  className="link-underline text-[0.72rem] uppercase tracking-[0.24em] text-[var(--bone-dim)] hover:text-[var(--bone)]"
                >
                  {l}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 pb-10 text-[0.72rem] text-[var(--bone-faint)] sm:flex-row">
            <p>© {new Date().getFullYear()} Kayumanggi. All rights reserved.</p>
            <p className="tracking-wide">Bonifacio Global City · Manila, Philippines</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--line-strong)] text-[var(--brass)]">
        {icon}
      </span>
      <div>
        <dt className="text-[0.66rem] uppercase tracking-[0.26em] text-[var(--bone-faint)]">
          {label}
        </dt>
        <dd className="mt-1 leading-relaxed text-[var(--bone-dim)]">{children}</dd>
      </div>
    </div>
  );
}

/* ------------------------------ content ------------------------------ */
/* The Voyage — Manila is the Filipino home; each other stop is an honest
   table of that city's own cuisine, cooked faithfully (not fused). */
const MENU = [
  {
    stop: "Stop 01",
    city: "Manila",
    coords: "14°35′N · 121°00′E",
    kitchen: "the Filipino table",
    dishes: [
      {
        name: "Sisig",
        price: "₱880",
        desc: "Sizzling pork jowl and cheek, calamansi, bird’s-eye chili, a duck egg folded in tableside.",
      },
      {
        name: "Pancit Palabok",
        price: "₱720",
        desc: "Rice noodles under a shrimp-annatto sauce, smoked tinapa, chicharrón, salted egg.",
      },
      {
        name: "Lechon Kawali",
        price: "₱1,180",
        desc: "Twice-cooked pork belly, glass-crisp skin, aged liver-vinegar.",
      },
      {
        name: "Kare-Kare",
        price: "₱1,640",
        desc: "Oxtail in a toasted-peanut sauce, banana heart, eggplant, bagoong on the side.",
      },
      {
        name: "Lechon",
        price: "₱1,880",
        desc: "Spit-roasted suckling pig, lemongrass and garlic, skin that shatters. Our centerpiece.",
      },
    ],
  },
  {
    stop: "Stop 02",
    city: "Tokyo",
    coords: "35°41′N · 139°41′E",
    kitchen: "the raw bar",
    dishes: [
      {
        name: "Sashimi Moriawase",
        price: "₱1,480",
        desc: "The day’s catch, hand-cut at the counter — bluefin, hamachi, botan ebi.",
      },
      {
        name: "Edomae Nigiri",
        price: "₱1,280",
        desc: "A six-piece selection, aged fish over warm red-vinegar rice.",
      },
      {
        name: "Gindara Saikyo-yaki",
        price: "₱1,420",
        desc: "Black cod marinated three days in white miso, grilled over binchōtan.",
      },
    ],
  },
  {
    stop: "Stop 03",
    city: "Paris",
    coords: "48°51′N · 2°21′E",
    kitchen: "the bistro",
    dishes: [
      {
        name: "Bœuf Bourguignon",
        price: "₱1,680",
        desc: "Beef cheek braised in Burgundy, lardons, pearl onions, button mushrooms.",
      },
      {
        name: "Coq au Vin",
        price: "₱1,440",
        desc: "Rooster slow-cooked in red wine, smoked bacon, baby onions, thyme.",
      },
      {
        name: "Quiche Lorraine",
        price: "₱680",
        desc: "Blind-baked pastry, smoked bacon, Gruyère, nutmeg cream.",
      },
      {
        name: "Ratatouille",
        price: "₱780",
        desc: "Provençal summer vegetables, confit slow, basil oil. From Chef’s garden.",
      },
    ],
  },
  {
    stop: "Stop 04",
    city: "Roma",
    coords: "41°54′N · 12°30′E",
    kitchen: "the trattoria",
    dishes: [
      {
        name: "Pizza Napoletana",
        price: "₱780",
        desc: "Twenty-four-hour dough, San Marzano, fior di latte, basil — from the wood oven.",
      },
      {
        name: "Cacio e Pepe",
        price: "₱920",
        desc: "Tonnarelli, Pecorino Romano, cracked black pepper. Three things, done right.",
      },
      {
        name: "Tagliatelle al Ragù",
        price: "₱1,080",
        desc: "Hand-cut tagliatelle, a Bolognese ragù simmered the whole afternoon.",
      },
    ],
  },
];

const GALLERY = [
  {
    src: "/gallery-kinilaw.jpg",
    label: "Manila · kinilaw",
    alt: "Cured tuna kinilaw on a dark ceramic plate with calamansi and micro-herbs, beside terracotta bowls and a candle",
  },
  {
    src: "/gallery-sashimi.jpg",
    label: "Tokyo · the raw bar",
    alt: "Nigiri and sashimi on a slate board at a dark counter, lit by a brass candlestick",
  },
  {
    src: "/gallery-boeuf.jpg",
    label: "Paris · the pass",
    alt: "A steaming bowl of Bœuf Bourguignon on the kitchen pass with a brass spoon resting beside it",
  },
  {
    src: "/gallery-pasta.jpg",
    label: "Roma · fresh pasta",
    alt: "A nest of hand-cut tagliatelle dusted with flour on dark marble, beside a wooden rolling pin",
  },
  {
    src: "/gallery-ube.jpg",
    label: "Ube, to end",
    alt: "An ube dessert with torched meringue and gold leaf on a brass plate, lit by a single candle",
  },
  {
    src: "/gallery-chefs-counter.jpg",
    label: "The chef's counter",
    alt: "A chef finishing a plate with tweezers at a dark stone counter, steam rising",
  },
];

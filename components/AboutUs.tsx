import { Sparkles } from "lucide-react";

const STATS = [
  { value: "12+", label: "Curated Vehicles" },
  { value: "24/7", label: "Assistance" },
  { value: "Instant", label: "Telegram Booking" },
];

export function AboutUs() {
  return (
    <section className="border-b border-zinc-800/80 bg-zinc-950 px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            About Us
          </span>
          <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
            Premium Luxury Car Rentals in Addis Ababa
          </h2>
        </div>

        <div className="mx-auto mt-6 max-w-3xl space-y-4 text-center text-sm leading-relaxed text-zinc-400 sm:text-base">
          <p>
            Based in Bole Medhanialem, Addis Ababa, we are a premium luxury car
            rental service built around exceptional quality and effortless
            booking. Every vehicle in our fleet is hand-selected, meticulously
            maintained, and ready to make your journey — business or leisure —
            feel first-class.
          </p>
          <p>
            We keep things refreshingly simple: transparent ETB daily and weekly
            pricing, no hidden fees, and instant Telegram booking straight from
            this site. Browse the live fleet, tap a car, and arrange everything
            in a few messages — no phone calls, no waiting rooms.
          </p>
          <p>
            From airport transfers to wedding cars and weekend getaways, our
            team is here around the clock to get you behind the wheel of the
            right car, right when you need it.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 text-center"
            >
              <p className="text-3xl font-extrabold text-amber-400">{s.value}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

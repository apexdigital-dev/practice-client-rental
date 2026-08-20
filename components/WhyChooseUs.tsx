import {
  CalendarClock,
  CarFront,
  MessageCircle,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const FEATURES = [
  {
    icon: CalendarClock,
    title: "Flexible Daily & Weekly Rates",
    description:
      "Transparent ETB daily and weekly pricing with no hidden fees — choose the rental period that fits your plans.",
  },
  {
    icon: UserRound,
    title: "Optional Chauffeur Service",
    description:
      "Experienced local drivers available for city or long-distance travel — sit back and enjoy the ride.",
  },
  {
    icon: MessageCircle,
    title: "24/7 Customer Assistance",
    description:
      "Round-the-clock support by phone and Telegram — we're always one message away, day or night.",
  },
  {
    icon: CarFront,
    title: "Curated Luxury Fleet",
    description:
      "A hand-picked selection of premium, meticulously maintained vehicles — from executive sedans to wedding-ready cars.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent & Secure Booking",
    description:
      "Instant Telegram booking with clear terms and dependable, verified vehicles you can trust.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="border-b border-zinc-800/80 bg-zinc-950 px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
            Why Choose Us
          </h2>
          <p className="mt-3 text-sm text-zinc-400 sm:text-base">
            A premium luxury rental experience designed around your time, comfort,
            and peace of mind.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 transition hover:border-zinc-700 hover:shadow-lg hover:shadow-black/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 ring-1 ring-amber-400/30">
                <f.icon className="h-6 w-6 text-amber-400" aria-hidden />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

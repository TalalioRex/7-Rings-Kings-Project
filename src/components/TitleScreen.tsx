import Image from "next/image";

type TitleScreenProps = {
  onStart: () => void;
};

export function TitleScreen({ onStart }: TitleScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-8">
      <section className="relative w-full max-w-5xl overflow-hidden rounded-lg border border-white/15 bg-black/45 p-6 shadow-neon backdrop-blur md:p-10">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,79,216,0.16),transparent_35%,rgba(64,245,255,0.14))]" />
        <div className="relative grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <Image
              alt="7 Rings 7 Kings"
              className="mb-5 h-auto w-48 drop-shadow-[0_0_22px_rgba(64,245,255,0.35)] md:w-64"
              height={260}
              priority
              src="/assets/brand/7-rings-logo.png"
              width={520}
            />
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-neonGreen">7 Rings 7 Kings Universe</p>
            <h1 className="mt-4 text-4xl font-black leading-tight text-white md:text-6xl">
              7 Rings 7 Kings
              <span className="block text-neonCyan">A Very Suspicious 7-Eleven</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 md:text-lg">
              Serious heroes. Stupid destiny. Beautiful neon chaos.
            </p>
            <button
              className="mt-8 rounded-md border border-neonCyan/70 bg-neonCyan px-6 py-3 font-black uppercase tracking-[0.16em] text-black shadow-neon transition hover:scale-[1.02] hover:bg-white"
              onClick={onStart}
            >
              Enter Game
            </button>
          </div>
          <div className="rounded-lg border border-white/10 bg-void/70 p-5">
            <div className="grid grid-cols-3 gap-3">
              {["Pink", "Yellow", "Purple", "Red", "Cyan", "Green"].map((ring, index) => (
                <div
                  className="aspect-square rounded-full border border-white/15 bg-black/50 shadow-neon"
                  key={ring}
                  style={{
                    boxShadow: `0 0 26px ${["#ff4fd8", "#f7ff4a", "#b983ff", "#ff4764", "#40f5ff", "#5bffb5"][index]}66`
                  }}
                  title={`${ring} ring signal`}
                />
              ))}
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-300">
              Phase 1 opens with a fake-money suspicious 7-Eleven slot prototype built from the current creature assets.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

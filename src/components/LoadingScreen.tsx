export function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="w-full max-w-md rounded-lg border border-cyan-300/20 bg-black/35 p-6 text-center shadow-neon backdrop-blur">
        <p className="text-xs uppercase tracking-[0.32em] text-cyan-200">Loading Prototype</p>
        <h1 className="mt-3 text-3xl font-black text-white">7 Rings</h1>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-neonPink via-neonCyan to-neonGreen" />
        </div>
      </section>
    </main>
  );
}

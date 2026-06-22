import { BET_OPTIONS, JACKPOT_CONTRIBUTION_RATE, JACKPOT_PAYLINE_ID, JACKPOT_SEED } from "@/lib/gameConfig";
import { SYMBOLS } from "@/lib/symbols";
import { PAYLINES } from "@/lib/paylines";
import { SymbolTile } from "@/components/SymbolTile";

type PaytableModalProps = {
  onClose: () => void;
};

export function PaytableModal({ onClose }: PaytableModalProps) {
  return (
    <ModalFrame title="Paytable" onClose={onClose}>
      <p className="text-sm leading-6 text-slate-300">
        Fake-money demo values only. Payouts are multipliers of the selected bet and are not casino math, RTP, or certified odds.
      </p>

      <div className="mt-5 rounded-md border border-cyan-300/20 bg-cyan-300/10 p-4">
        <h3 className="font-black text-neonCyan">How Spins Work</h3>
        <p className="mt-2 text-sm leading-6 text-slate-200">
          The prototype uses five explicit reel strips. Each reel chooses one stop index, then shows the symbol above, on, and below that stop.
          The 10 paylines pay left-to-right only. Shrimpie pays as a premium jackpot symbol, but Wilds do not substitute for Shrimpie.
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        {SYMBOLS.map((symbol) => (
          <div
            className={[
              "grid grid-cols-[72px_1fr] gap-3 rounded-md border bg-white/[0.04] p-3",
              symbol.type === "jackpot" ? "border-yellow-300/45 shadow-[0_0_28px_rgba(255,209,102,0.16)]" : "border-white/10"
            ].join(" ")}
            key={symbol.id}
          >
            <SymbolTile symbolId={symbol.id} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-black text-white">{symbol.displayName}</h3>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-300">
                  {symbol.type}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-400">{symbol.description}</p>
              {symbol.payouts ? (
                <p className="mt-2 text-sm font-bold text-neonCyan">
                  3 = {symbol.payouts.three}x / 4 = {symbol.payouts.four}x / 5 = {symbol.payouts.five}x
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-md border border-neonGreen/25 bg-neonGreen/10 p-4">
        <h3 className="font-black text-neonGreen">Free Spins</h3>
        <p className="mt-2 text-sm leading-6 text-slate-200">3 Scatters = 8 free spins. 4 Scatters = 12. 5 or more = 20.</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Scatters pay anywhere: 3 = 2x bet, 4 = 7x bet, 5+ = 23x bet. Free spins do not retrigger in this prototype.
        </p>
      </div>

      <div className="mt-5 rounded-md border border-yellow-300/30 bg-yellow-300/10 p-4">
        <h3 className="font-black text-yellow-200">Local Demo Jackpot</h3>
        <p className="mt-2 text-sm leading-6 text-slate-200">
          The jackpot starts at {JACKPOT_SEED.toLocaleString()} demo coins. Each paid spin adds{" "}
          {Math.round(JACKPOT_CONTRIBUTION_RATE * 100)}% of the bet, rounded to at least 1 demo coin.
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Trigger: five natural Shrimpie the Seventh symbols on {JACKPOT_PAYLINE_ID === "any" ? "any active payline" : `the ${JACKPOT_PAYLINE_ID} payline`}.
          Wilds do not substitute for Shrimpie. On hit, the current meter is paid and the jackpot resets to the seed value.
        </p>
      </div>

      <div className="mt-5 rounded-md border border-white/10 bg-white/[0.04] p-4">
        <h3 className="font-black text-white">Wild Rules</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Chuck Vadar Wild substitutes for regular symbols only. Wilds do not substitute for Scatters or Shrimpie Jackpot symbols.
        </p>
      </div>

      <div className="mt-5 rounded-md border border-white/10 bg-white/[0.04] p-4">
        <h3 className="font-black text-white">Paylines</h3>
        <p className="mt-2 text-sm text-slate-300">10 active paylines are always on. Bet options: {BET_OPTIONS.join(", ")} demo coins.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {PAYLINES.map((line) => (
            <p className="rounded border border-white/10 bg-black/30 px-3 py-2 text-xs text-slate-300" key={line.id}>
              <span className="font-bold text-white">{line.name}:</span> [{line.positions.join(", ")}]
            </p>
          ))}
        </div>
      </div>
    </ModalFrame>
  );
}

function ModalFrame({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <section className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-white/15 bg-ink p-5 shadow-neon">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-white">{title}</h2>
          <button className="rounded-md border border-white/15 px-3 py-2 font-bold text-white" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </section>
    </div>
  );
}

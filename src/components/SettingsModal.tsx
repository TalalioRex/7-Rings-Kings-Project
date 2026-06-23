type SettingsModalProps = {
  soundEnabled: boolean;
  musicEnabled: boolean;
  fastSpinEnabled: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onToggleFastSpin: () => void;
  onResetBalance: () => void;
  onClose: () => void;
};

export function SettingsModal({
  soundEnabled,
  musicEnabled,
  fastSpinEnabled,
  onToggleSound,
  onToggleMusic,
  onToggleFastSpin,
  onResetBalance,
  onClose
}: SettingsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <section className="w-full max-w-lg rounded-lg border border-white/15 bg-ink p-5 shadow-neon">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-white">Settings</h2>
          <button className="rounded-md border border-white/15 px-3 py-2 font-bold text-white" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          <SettingToggle label="Sound Effects" enabled={soundEnabled} onClick={onToggleSound} />
          <SettingToggle label="Music placeholder" enabled={musicEnabled} onClick={onToggleMusic} />
          <SettingToggle label="Fast spin" enabled={fastSpinEnabled} onClick={onToggleFastSpin} />
        </div>

        <button
          className="mt-5 w-full rounded-md border border-warningRed/40 bg-warningRed/10 px-4 py-3 font-black uppercase tracking-[0.14em] text-warningRed"
          onClick={onResetBalance}
        >
          Reset Demo Balance
        </button>
        <p className="mt-3 text-xs leading-5 text-slate-400">
          This prototype uses fake demo coins only. There are no deposits, withdrawals, payments, real wallets, or real-money systems.
        </p>
      </section>
    </div>
  );
}

function SettingToggle({ label, enabled, onClick }: { label: string; enabled: boolean; onClick: () => void }) {
  return (
    <button
      className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-left"
      onClick={onClick}
    >
      <span className="font-bold text-white">{label}</span>
      <span
        className={[
          "rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em]",
          enabled ? "bg-neonGreen text-black" : "bg-white/10 text-slate-300"
        ].join(" ")}
      >
        {enabled ? "On" : "Off"}
      </span>
    </button>
  );
}

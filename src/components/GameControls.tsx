type GameControlsProps = {
  bet: number;
  balance: number;
  canDecreaseBet: boolean;
  canIncreaseBet: boolean;
  canSpin: boolean;
  isSpinning: boolean;
  isFreeSpinMode: boolean;
  onDecreaseBet: () => void;
  onIncreaseBet: () => void;
  onSpin: () => void;
  onOpenPaytable: () => void;
  onOpenSettings: () => void;
};

export function GameControls({
  bet,
  canDecreaseBet,
  canIncreaseBet,
  canSpin,
  isSpinning,
  isFreeSpinMode,
  onDecreaseBet,
  onIncreaseBet,
  onSpin,
  onOpenPaytable,
  onOpenSettings
}: GameControlsProps) {
  return (
    <section className="slot-console control-bar" aria-label="Slot machine controls">
      <div className="control-grid">
        <div className="control-utility-group">
          <button className="control-utility-button control-utility-primary" onClick={onOpenPaytable} type="button">
            Paytable
          </button>
          <button className="control-utility-button" onClick={onOpenSettings} type="button">
            Settings
          </button>
        </div>

        <div className="bet-control-group">
          <button
            aria-label="Decrease bet"
            className="bet-step-button"
            disabled={!canDecreaseBet}
            onClick={onDecreaseBet}
            type="button"
          >
            -
          </button>
          <div className="bet-readout">
            <p>{isFreeSpinMode ? "Free Spin Bet" : "Bet"}</p>
            <strong>{bet.toLocaleString()}</strong>
          </div>
          <button
            aria-label="Increase bet"
            className="bet-step-button"
            disabled={!canIncreaseBet}
            onClick={onIncreaseBet}
            type="button"
          >
            +
          </button>
        </div>

        <button
          className="spin-button control-spin-button"
          disabled={!canSpin}
          onClick={onSpin}
          type="button"
        >
          {isSpinning ? "Spin" : isFreeSpinMode ? "Free" : "Spin"}
        </button>
      </div>
    </section>
  );
}

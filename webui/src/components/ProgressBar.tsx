interface Props {
  totalMl: number;
  goalMl: number;
  progress: number; // 0.0+ from the API
}

// Water-fill metaphor: a rounded track that fills with the aqua accent, and
// celebrates (green/gold) once the goal is met. Exposes progressbar semantics.
export function ProgressBar({ totalMl, goalMl, progress }: Props) {
  const pct = Math.round(progress * 100);
  const fillWidth = `${Math.min(progress, 1) * 100}%`;
  const reached = progress >= 1;

  return (
    <div className="progress">
      <div className="progress__numbers">
        <span className="progress__count">
          {totalMl} <span className="progress__unit">/ {goalMl} ml</span>
        </span>
        <span className={`progress__pct ${reached ? 'is-reached' : ''}`}>{pct}%</span>
      </div>
      <div
        className={`progress__track ${reached ? 'is-reached' : ''}`}
        role="progressbar"
        aria-valuenow={totalMl}
        aria-valuemin={0}
        aria-valuemax={goalMl}
        aria-label="今日喝水進度"
      >
        <div className="progress__fill" style={{ width: fillWidth }}>
          <span className="progress__wave" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

interface Props {
  totalMl: number;
  goalMl: number;
}

// Water-fill progress with shimmer; celebrates (green) at the goal.
// Recreated from the design handoff's WaterProgress.
export function ProgressBar({ totalMl, goalMl }: Props) {
  const pct = goalMl > 0 ? Math.min(totalMl / goalMl, 1) : 0;
  const disp = goalMl > 0 ? Math.round((totalMl / goalMl) * 100) : 0;
  const done = pct >= 1;

  return (
    <div>
      <div className="prog-head">
        <span className="prog-head__label">今日進度</span>
        <div>
          <span className={`prog-head__num ${done ? 'is-done' : ''}`}>{totalMl.toLocaleString()}</span>
          <span className="prog-head__goal"> / {goalMl.toLocaleString()} ml</span>
        </div>
      </div>
      <div
        className="prog-track"
        role="progressbar"
        aria-valuenow={totalMl}
        aria-valuemin={0}
        aria-valuemax={goalMl}
        aria-label="今日喝水進度"
      >
        <div className={`prog-fill ${done ? 'is-done' : ''}`} style={{ width: `${pct * 100}%` }} />
        {pct > 0.06 && <div className="prog-shimmer" />}
      </div>
      <div className="prog-foot">
        <span className={`prog-foot__pct ${done ? 'is-done' : ''}`}>{done ? '✓ 今日達標！' : `${disp}%`}</span>
        <span className="prog-foot__goal">目標 {goalMl.toLocaleString()} ml</span>
      </div>
    </div>
  );
}

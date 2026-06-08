// 顯示花田紀錄列表

import { FLOWER_SPECIES, RARITY_LABEL, RARITY_STARS, readGarden } from '../lib/garden';
import { localToday } from '../lib/api';

interface Props {
  goalMl: number;
  todayTotalMl: number;
  onBack: () => void;
}

export function GardenScreen({ goalMl, todayTotalMl, onBack }: Props) {
  const today = localToday();
  // 依日期降序，只顯示有記錄的日期
  const entries = [...readGarden()].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="garden">
      <div className="garden-header">
        <button className="garden-back" onClick={onBack} aria-label="返回">
          ←
        </button>
        <span>🌸 我的花田</span>
      </div>

      {entries.length === 0 && (
        <p className="garden-entry__hint">還沒有花朵記錄，喝水達標就能種下第一朵花 🌱</p>
      )}

      {entries.map((entry) => {
        const species = FLOWER_SPECIES.find((f) => f.id === entry.speciesId);
        if (!species) return null;
        const isToday = entry.date === today;
        const showHint = isToday && !entry.metGoal;
        const remaining = Math.max(goalMl - todayTotalMl, 0);
        const legendary = species.rarity === 'legendary';

        return (
          <div
            key={entry.date}
            className={`garden-entry${legendary ? ' garden-entry--legendary' : ''}`}
          >
            <div className="garden-entry__date">
              {entry.date}
              {isToday && '（今天）'}
            </div>
            <div className="garden-entry__row">
              <span className="garden-entry__name">
                {species.emoji} {species.name}
              </span>
              <span className="garden-entry__rarity">
                {RARITY_STARS[species.rarity]} {RARITY_LABEL[species.rarity]}
              </span>
              {entry.metGoal && <span aria-label="已達標">✅</span>}
            </div>
            {showHint && (
              <div className="garden-entry__hint">還差 {remaining}ml 才能開花</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

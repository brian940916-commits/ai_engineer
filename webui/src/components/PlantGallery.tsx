import type { PlantMood, PlantStage } from '../types';
import { MOOD_LABEL, STAGE_LABEL } from '../lib/copy';
import { PlantView } from './PlantView';

const STAGES: PlantStage[] = ['seed', 'sprout', 'growing', 'budding', 'blooming'];
const MOODS: PlantMood[] = ['sleepy', 'happy', 'ok', 'thirsty', 'wilting'];

// Dev-only visual harness: open `?preview` to inspect every stage × mood combo
// without a backend. Not part of the shipped app flow.
export function PlantGallery() {
  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', fontWeight: 800 }}>Plant preview — stage × mood</h1>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${MOODS.length}, 1fr)`, gap: 8 }}>
        {STAGES.flatMap((stage) =>
          MOODS.map((mood) => (
            <figure
              key={`${stage}-${mood}`}
              style={{
                margin: 0,
                background: 'var(--surface)',
                borderRadius: 16,
                padding: 8,
                textAlign: 'center',
                boxShadow: 'var(--shadow)',
              }}
            >
              <div style={{ width: 104, height: 156, margin: '0 auto' }}>
                <PlantView plant={{ stage, mood, progress: 0 }} />
              </div>
              <figcaption style={{ fontSize: 12, color: 'var(--muted)' }}>
                {STAGE_LABEL[stage]} · {MOOD_LABEL[mood]}
              </figcaption>
            </figure>
          ))
        )}
      </div>
    </div>
  );
}

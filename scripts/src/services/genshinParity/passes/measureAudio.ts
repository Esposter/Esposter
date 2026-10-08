import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";
import type { SoundEffect } from "genshin-engine";

import { SOUND_SAMPLE_RATE } from "#src/services/genshinAssets/shared/constants";
import { readWorldData } from "#src/services/genshinAssets/shared/readWorldData";
import { DerivedAssetSoundEffectMap } from "#src/services/genshinAssets/sound/DerivedAssetSoundEffectMap";
import { readGameSoundEffect } from "#src/services/genshinAssets/sound/readGameSoundEffect";
import { scoreSoundEffect } from "#src/services/genshinParity/sound/scoreSoundEffect";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { computeSoundEffectSamples, SOUND_EFFECT_BAND_EDGES } from "genshin-engine";

// The seed of the second take each effect's grain is read against, past the three the shipped render seeds its noises
// With, so all six are apart
const GRAIN_SEED = 3;
// The audio pass: each sound effect a component plays, rendered by the engine, against the game's own sounds it was
// Fitted from at their mix volumes, both channels band by band every 5 milliseconds (`scoreSoundEffect`), gated at how
// Far a second take of the same levels, its noise seeded apart, sits from the first: the noise's own grain, which only
// The game's samples would close. Its onset after what sets it off is not read here: a stage's delay is one reading off
// The recording's frames, written straight into its constant with nothing solved over it, and the effect's own rise is
// Already its first frames' bands
export const measureAudio = async (component: DerivedAssetComponent): Promise<ParityPassMeasure> => {
  const effects = Object.entries(DerivedAssetSoundEffectMap[component]);
  if (effects.length === 0) return { notes: ["no sound of the game's matched yet"], readings: [] };
  const soundsPath = `${component}/sounds.json`;
  const fitted = await readWorldData<Record<string, SoundEffect>>(soundsPath);
  const measures: ParityPassMeasure[] = [];
  for (const [name, { pattern, sounds }] of effects) {
    const effect = fitted[name];
    if (!effect) throw new InvalidOperationError(Operation.Read, soundsPath, `holds no effect ${name}`);
    const ours = computeSoundEffectSamples(effect, SOUND_SAMPLE_RATE);
    // oxlint-disable-next-line no-await-in-loop -- each effect's sounds are decoded into one folder in turn
    const { bandBiases, correlation, distance } = scoreSoundEffect(ours, await readGameSoundEffect(pattern, sounds));
    const grain = scoreSoundEffect(computeSoundEffectSamples(effect, SOUND_SAMPLE_RATE, GRAIN_SEED), ours).distance;
    measures.push({
      notes: [
        `${name}: channels correlated ${correlation.ours.toFixed(2)} against the game's ${correlation.game.toFixed(2)}; band biases ${bandBiases.map((bias, band) => `${SOUND_EFFECT_BAND_EDGES[band]} Hz ${bias.toFixed(1)}`).join(", ")}`,
      ],
      readings: [{ gate: grain, name: `${name} bands`, unit: "dB", value: distance }],
    });
  }
  return { notes: measures.flatMap(({ notes }) => notes), readings: measures.flatMap(({ readings }) => readings) };
};

import type { MusicScore } from "#src/models/genshinParity/MusicScore";

import { LISTEN_BAND_CENTRES, PARITY_MUSIC_SCORES_PATH } from "#src/services/genshinParity/constants";
import { writeFile } from "node:fs/promises";

const formatBand = (centre: number): string => (centre >= 1000 ? `${centre / 1000} kHz` : `${centre} Hz`);
// The committed report of the music's last `listen`, every segment that plays anything, rewritten whole each run
export const writeParityMusicScores = (screen: string, scores: { id: number; score: MusicScore }[]): Promise<void> =>
  writeFile(
    PARITY_MUSIC_SCORES_PATH,
    `${[
      "# Parity music scores",
      "",
      "Each segment of the music's last `pnpm -C scripts genshin:parity listen`, our render against the game's own",
      "sound. Pitch agreement runs from 0 to 1 (identical); each band's distance is the mean gap between the two's",
      "levels in decibels, 0 identical, and the distance their mean. Commit it with the change that moved it, as a",
      "bench's report is committed.",
      "",
      `| Screen | Segment | Pitch agreement | Distance | ${LISTEN_BAND_CENTRES.map(formatBand).join(" | ")} |`,
      `| :----- | :------ | --------------: | -------: | ${LISTEN_BAND_CENTRES.map(() => "---:").join(" | ")} |`,
      ...scores.map(
        ({ id, score: { bandDistances, distance, pitchAgreement } }) =>
          `| \`${screen}\` | \`${id}\` | ${pitchAgreement.toFixed(3)} | ${distance.toFixed(1)} dB | ${bandDistances.map((bandDistance) => bandDistance.toFixed(1)).join(" | ")} |`,
      ),
    ].join("\n")}\n`,
  );

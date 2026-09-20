import type { CandidateVoice } from "#src/models/voiceMatch/CandidateVoice";
import type { CharacterReference } from "#src/models/voiceMatch/CharacterReference";
import type { VoiceFit } from "#src/models/voiceMatch/VoiceFit";

import {
  BANK_DIRECTORY,
  FIT_FLOOR,
  MAX_WORD_ERROR_RATE,
  MEDIAN,
  REFERENCE_DIRECTORY,
  WRITE_FLAG,
} from "#src/services/voiceMatch/constants";
import { getPercentile } from "#src/services/voiceMatch/getPercentile";
import { getPersonaVoiceSource } from "#src/services/voiceMatch/rank/getPersonaVoiceSource";
import { getVoiceFit } from "#src/services/voiceMatch/rank/getVoiceFit";
import { readGeneratedJson } from "#src/services/voiceMatch/readGeneratedJson";
import {
  PERSONA_MODULE_EXTENSION,
  PERSONA_VOICES_DIRECTORY,
} from "@esposter/genshin-persona/src/services/constants.ts";
import { getPersonaCardName } from "@esposter/genshin-persona/src/services/getPersonaCardName.ts";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SCORE_DECIMALS = 3;

// Stage 3 to 6 of the voice match benchmark: every eligible voice fitted to every profiled character, the best one
// Per character reported with its runner-up, the three numbers a run is judged by beside the table — and, with
// `--write`, the fits at or above the floor generated into the plugin, one voice module per character
const isWriting = process.argv.includes(WRITE_FLAG);
const references = readGeneratedJson<CharacterReference>(REFERENCE_DIRECTORY);
const bank = readGeneratedJson<CandidateVoice>(BANK_DIRECTORY);
// The intelligibility gate: a voice that cannot read the carrier back is out of the pool for every character,
// Whatever its locale claims
const candidates = bank.filter(({ wordErrorRate }) => wordErrorRate <= MAX_WORD_ERROR_RATE);
const referenceRateMedian = getPercentile(
  references.map(({ profile }) => profile.syllablesPerSecond),
  MEDIAN,
);
const candidateRateMedian = getPercentile(
  candidates.map(({ profile }) => profile.syllablesPerSecond),
  MEDIAN,
);
console.info(
  `${candidates.length} of ${bank.length} voices intelligible; reference ${referenceRateMedian.toFixed(1)} syl/s and candidates ${candidateRateMedian.toFixed(1)} syl/s at the median`,
);

const bestFits = new Map<string, VoiceFit>();
for (const { name, profile } of references) {
  const fits = candidates
    .flatMap((candidate) => getVoiceFit(profile, candidate, referenceRateMedian, candidateRateMedian) ?? [])
    .toSorted((a, b) => b.score - a.score);
  const [best, runnerUp] = fits;
  if (!best) {
    console.info(`${name}: no voice inside the clamps`);
    continue;
  }

  bestFits.set(name, best);
  const runnerUpText = runnerUp ? ` (then ${runnerUp.voice} ${runnerUp.score.toFixed(SCORE_DECIMALS)})` : "";
  console.info(
    `${name}: ${best.voice} pitch ${best.pitch} rate ${best.rate} — ${best.score.toFixed(SCORE_DECIMALS)}${runnerUpText}`,
  );
}

const scores = Array.from(bestFits.values(), ({ score }) => score);
const meanScore = scores.reduce((sum, score) => sum + score, 0) / (scores.length || 1);
const belowFloor = [...bestFits].filter(([, { score }]) => score < FIT_FLOOR).map(([name]) => name);
const chosenVoices = new Set(Array.from(bestFits.values(), ({ voice }) => voice));
const referenceSignalToNoiseDb = getPercentile(
  references.map(({ profile }) => profile.signalToNoiseDb),
  MEDIAN,
);
const candidateSignalToNoiseDb = getPercentile(
  candidates.map(({ profile }) => profile.signalToNoiseDb),
  MEDIAN,
);
console.info(`mean composite ${meanScore.toFixed(SCORE_DECIMALS)} over ${bestFits.size} characters`);
console.info(
  `${belowFloor.length} below the floor of ${FIT_FLOOR}${belowFloor.length > 0 ? `: ${belowFloor.join(", ")}` : ""}`,
);
console.info(`${chosenVoices.size} distinct voices chosen`);
console.info(
  `signal to noise: reference ${referenceSignalToNoiseDb.toFixed(0)} dB, candidates ${candidateSignalToNoiseDb.toFixed(0)} dB at the median`,
);

if (isWriting) {
  // The folder is the run's whole output, so a character that fell under the floor this run keeps no stale voice
  rmSync(PERSONA_VOICES_DIRECTORY, { force: true, recursive: true });
  mkdirSync(PERSONA_VOICES_DIRECTORY, { recursive: true });
  let written = 0;
  for (const [name, fit] of bestFits) {
    if (fit.score < FIT_FLOOR) continue;

    const personaCardName = getPersonaCardName(name);
    writeFileSync(
      join(PERSONA_VOICES_DIRECTORY, `${personaCardName}${PERSONA_MODULE_EXTENSION}`),
      getPersonaVoiceSource(personaCardName, fit),
    );
    written += 1;
  }

  console.info(`${written} voices generated to ${PERSONA_VOICES_DIRECTORY}`);
}

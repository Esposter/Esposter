import type { CandidateVoice } from "#src/models/voiceMatch/CandidateVoice";
import type { CharacterReference } from "#src/models/voiceMatch/CharacterReference";
import type { VoiceFit } from "#src/models/voiceMatch/VoiceFit";

import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import {
  BANK_PATH,
  FIT_FLOOR,
  MAX_WORD_ERROR_RATE,
  MEDIAN,
  REFERENCE_PATH,
  WRITE_FLAG,
} from "#src/services/voiceMatch/constants";
import { getPercentile } from "#src/services/voiceMatch/getPercentile";
import { getVoiceFit } from "#src/services/voiceMatch/rank/getVoiceFit";
import { writeCardVoice } from "#src/services/voiceMatch/rank/writeCardVoice";
import { readFileSync } from "node:fs";

const SCORE_DECIMALS = 3;

// Stage 3 to 6 of the voice match benchmark: every eligible voice fitted to every profiled character, the best one
// Per character reported with its runner-up, the three numbers the proposal asks to have judged beside the table —
// And, with `--write`, the fits at or above the floor written into the cards
const isWriting = process.argv.includes(WRITE_FLAG);
const references = parseMachineJson<CharacterReference[]>(readFileSync(REFERENCE_PATH, "utf8"));
const bank = parseMachineJson<CandidateVoice[]>(readFileSync(BANK_PATH, "utf8"));
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

const scores = [...bestFits.values()].map(({ score }) => score);
const meanScore = scores.reduce((sum, score) => sum + score, 0) / (scores.length || 1);
const belowFloor = [...bestFits].filter(([, { score }]) => score < FIT_FLOOR).map(([name]) => name);
const chosenVoices = new Set([...bestFits.values()].map(({ voice }) => voice));
console.info(`mean composite ${meanScore.toFixed(SCORE_DECIMALS)} over ${bestFits.size} characters`);
console.info(
  `${belowFloor.length} below the floor of ${FIT_FLOOR}${belowFloor.length > 0 ? `: ${belowFloor.join(", ")}` : ""}`,
);
console.info(`${chosenVoices.size} distinct voices chosen`);
console.info(
  `signal to noise: reference ${getPercentile(
    references.map(({ profile }) => profile.signalToNoiseDb),
    MEDIAN,
  ).toFixed(0)} dB, candidates ${getPercentile(
    candidates.map(({ profile }) => profile.signalToNoiseDb),
    MEDIAN,
  ).toFixed(0)} dB at the median`,
);

if (isWriting) {
  let written = 0;
  for (const [name, fit] of bestFits) if (fit.score >= FIT_FLOOR && writeCardVoice(name, fit)) written += 1;
  console.info(`${written} cards written`);
}

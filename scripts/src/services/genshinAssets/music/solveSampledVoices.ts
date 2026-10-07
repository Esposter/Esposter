import type { CataloguedInstrument } from "#src/models/genshinAssets/music/CataloguedInstrument";
import type { SampledCandidate } from "#src/models/genshinAssets/music/SampledCandidate";
import type { SampledVoiceSolution } from "#src/models/genshinAssets/music/SampledVoiceSolution";
import type { ShapedMusicScore } from "#src/models/genshinParity/music/ShapedMusicScore";
import type { NoteEventTime } from "pitch-transcription/notes";

import { computeVoicePitchReference } from "#src/services/genshinAssets/music/computeVoicePitchReference";
import { readInstrumentRecordings } from "#src/services/genshinAssets/music/readInstrumentRecordings";
import { refineVoicePowers } from "#src/services/genshinAssets/music/refineVoicePowers";
import { renderSampledVoice } from "#src/services/genshinAssets/music/renderSampledVoice";
import { SAMPLED_VOICE_REFINED_COUNT } from "#src/services/genshinAssets/shared/constants";
import { applyMusicExpression } from "#src/services/genshinParity/music/applyMusicExpression";
import { computeAudibleFrames } from "#src/services/genshinParity/music/computeAudibleFrames";
import { computeBandEnergies } from "#src/services/genshinParity/music/computeBandEnergies";
import { computeBandFloor } from "#src/services/genshinParity/music/computeBandFloor";
import { computeChroma } from "#src/services/genshinParity/music/computeChroma";
import { computeGapsByOnsetAge } from "#src/services/genshinParity/music/computeGapsByOnsetAge";
import { getFrameSeconds } from "#src/services/genshinParity/music/getFrameSeconds";
import { scoreShapedMusic } from "#src/services/genshinParity/music/scoreShapedMusic";
import { solveNonNegativeSystem } from "#src/services/genshinParity/shared/solveNonNegativeSystem";
import { MUSIC_EXPRESSION_WINDOW_SECONDS } from "genshin-engine";
import { AUDIO_SAMPLE_RATE } from "pitch-transcription";

// Every combination of one candidate per voice, from `[]` up
const listCombinations = (counts: number[]): number[][] =>
  counts.reduce<number[][]>(
    (combinations, count) =>
      combinations.flatMap((combination) => Array.from({ length: count }, (_value, index) => [...combination, index])),
    [[]],
  );
const computeDot = (first: Float64Array, second: Float64Array): number =>
  first.reduce((sum, value, index) => sum + value * (second[index] ?? 0), 0);
// The shares of its solved levels a mix is tried at, loudest first, until it keeps the base's pitch agreement
const LEVEL_SHARES = [1, 1 / 2, 1 / 4, 1 / 8];
// Each voice's recorded instrument and level layered over `base`, the synthesizer's render as it ships under its
// `expression`, solved together against the game's sound by the listening score's own measures. Every instrument plays
// Each voice's notes alone at level 1, through the recordings they reach and with the release and tuning the game's
// Voice was fitted to, and only one that keeps the voice's pitch as well as its notes as pure tones do
// (`computeVoicePitchReference`) is a candidate for it, or the one nearest that where none does: pitch is what the bands
// Cannot hear. A candidate then plays under the same expression, as the one output gain the player scales every voice
// By. The game's sound is read as the base's band energies with the candidates' summed over them, frame by frame over
// The frames the score reads, each scaled by its power. For every combination of one candidate a voice, the powers come
// In closed form from least squares in each band's share of the game's energy, what the base leaves short of it the target,
// Which weighs a quiet frame as a loud one as the score's decibels do; the best combinations by that residual are
// Refined against the score's band distance (`refineVoicePowers`), and each one's mix is scored whole once its
// Expression is refitted to the game's (`scoreShapedMusic`), as `genshin:parity expression` refits the shipped music's,
// With its gaps by the time since a note began. A mix that loses the base's pitch agreement is tried again at a share of
// Its levels (`LEVEL_SHARES`) and dropped if none keeps it, since every level at none is the base itself and can only
// Be bettered. The mixes are ranked by distance, beside the base's own score
export const solveSampledVoices = async (
  catalogue: CataloguedInstrument[],
  voiceNotesList: NoteEventTime[][],
  voiceReleases: number[],
  voiceTunings: number[],
  game: Float32Array,
  base: Float32Array,
  expression: number[],
): Promise<{ baseline: ShapedMusicScore; solutions: SampledVoiceSolution[] }> => {
  const frames = computeAudibleFrames(computeChroma(game, AUDIO_SAMPLE_RATE).loudness);
  const frameTimes = frames.map((frame) => getFrameSeconds(frame, AUDIO_SAMPLE_RATE));
  const onsets = voiceNotesList.flat().map(({ startTimeSeconds }) => startTimeSeconds);
  const gameBands = computeBandEnergies(game, AUDIO_SAMPLE_RATE);
  const floors = gameBands.map((energies) => computeBandFloor(energies));
  const computeFrameEnergies = (bands: Float64Array[]): Float64Array =>
    Float64Array.from({ length: bands.length * frames.length }, (_value, index) => {
      const band = Math.floor(index / frames.length);
      return bands[band]?.[frames[index % frames.length] ?? 0] ?? 0;
    });
  const targets = computeFrameEnergies(gameBands).map((energy, index) =>
    Math.max(energy, floors[Math.floor(index / frames.length)] ?? 0),
  );
  const baseEnergies = computeFrameEnergies(computeBandEnergies(base, AUDIO_SAMPLE_RATE));
  const baseline = scoreShapedMusic(base, game, AUDIO_SAMPLE_RATE, frames);
  const references = voiceNotesList.map((voiceNotes, voice) =>
    computeVoicePitchReference(voiceNotes, voiceReleases[voice] ?? 0, voiceTunings[voice] ?? 0, game.length),
  );
  const voiceCandidatesList: SampledCandidate[][] = voiceNotesList.map(() => []);
  const voiceNearestList: { agreement: number; candidate?: SampledCandidate }[] = voiceNotesList.map(() => ({
    agreement: -Infinity,
  }));
  for (const instrument of catalogue) {
    // oxlint-disable-next-line no-await-in-loop -- one instrument's recordings are held at a time
    const regionSamplesMap = await readInstrumentRecordings(instrument, voiceNotesList.flat());
    for (const [voice, voiceNotes] of voiceNotesList.entries()) {
      const reference = references[voice];
      const nearest = voiceNearestList[voice];
      if (!reference || !nearest) continue;
      const rendered = renderSampledVoice(
        voiceNotes,
        instrument.regions,
        regionSamplesMap,
        voiceReleases[voice] ?? 0,
        voiceTunings[voice] ?? 0,
        AUDIO_SAMPLE_RATE,
        game.length,
      );
      const { agreement } = reference.computeSolo(rendered);
      const isCandidate = agreement >= reference.fundamentals.agreement;
      if (!isCandidate && agreement <= nearest.agreement) continue;
      const expressed = applyMusicExpression(rendered, AUDIO_SAMPLE_RATE, expression, MUSIC_EXPRESSION_WINDOW_SECONDS);
      const candidate = {
        energies: computeFrameEnergies(computeBandEnergies(expressed, AUDIO_SAMPLE_RATE)),
        instrument,
        rendered: expressed,
      };
      if (isCandidate) voiceCandidatesList[voice]?.push(candidate);
      else voiceNearestList[voice] = { agreement, candidate };
    }
  }
  const voiceKeptList = voiceCandidatesList.map((candidates, voice) => {
    const nearest = voiceNearestList[voice]?.candidate;
    return candidates.length > 0 || !nearest ? candidates : [nearest];
  });

  const computeShares = (energies: Float64Array): Float64Array =>
    energies.map((energy, index) => energy / (targets[index] ?? 1));
  const voiceSharesList = voiceKeptList.map((candidates) => candidates.map(({ energies }) => computeShares(energies)));
  // Every product the least squares reads, between any candidate of one voice and any of another, taken once
  const voiceProducts = voiceSharesList.map((rowSharesList) =>
    voiceSharesList.map((columnSharesList) =>
      rowSharesList.map((rowShares) => columnSharesList.map((columnShares) => computeDot(rowShares, columnShares))),
    ),
  );
  // What the base leaves short of each frame's share of the game's energy, which the candidates are solved to fill: a
  // Recording only adds energy, so a frame the base already fills asks nothing of it, and what adding costs there is
  // The refinement's to weigh in decibels. Unclipped, the base matched in decibels overfills the shares on average and
  // Every combination solves to silence
  const remainders = computeShares(baseEnergies).map((share) => Math.max(1 - share, 0));
  const voiceSums = voiceSharesList.map((sharesList) => sharesList.map((shares) => computeDot(shares, remainders)));
  const ranked = listCombinations(voiceSharesList.map((sharesList) => sharesList.length))
    .map((combination) => {
      const gram = combination.map((row, voice) =>
        combination.map((column, other) => voiceProducts[voice]?.[other]?.[row]?.[column] ?? 0),
      );
      const right = combination.map((index, voice) => voiceSums[voice]?.[index] ?? 0);
      const powers = solveNonNegativeSystem(gram, right);
      // At the exact solution of the powers' subset, the residual is the negated product of its powers with the
      // Right-hand side
      const residual = -powers.reduce((sum, power, voice) => sum + power * (right[voice] ?? 0), 0);
      return { combination, powers, residual };
    })
    .toSorted((firstCombination, secondCombination) => firstCombination.residual - secondCombination.residual)
    .slice(0, SAMPLED_VOICE_REFINED_COUNT);

  const solutions = ranked
    .flatMap(({ combination, powers }) => {
      const candidates = combination.flatMap((index, voice) => voiceKeptList[voice]?.[index] ?? []);
      const refined = refineVoicePowers(
        candidates.map(({ energies }) => energies),
        powers,
        baseEnergies,
        targets,
        floors,
        frames.length,
      );
      for (const share of LEVEL_SHARES) {
        const levels = refined.map((power) => share * Math.sqrt(power));
        const mix = Float32Array.from(base);
        for (const [voice, { rendered }] of candidates.entries())
          for (const [index, sample] of rendered.entries())
            mix[index] = (mix[index] ?? 0) + (levels[voice] ?? 0) * sample;
        const shaped = scoreShapedMusic(mix, game, AUDIO_SAMPLE_RATE, frames);
        if (shaped.score.pitchAgreement < baseline.score.pitchAgreement) continue;
        return [
          {
            instruments: candidates.map(({ instrument }) => instrument),
            levels,
            onsetAgeGaps: computeGapsByOnsetAge(shaped.bandLevelsList, frameTimes, onsets),
            shaped,
          },
        ];
      }
      return [];
    })
    .toSorted(
      (firstSolution, secondSolution) => firstSolution.shaped.score.distance - secondSolution.shaped.score.distance,
    );
  return { baseline, solutions };
};

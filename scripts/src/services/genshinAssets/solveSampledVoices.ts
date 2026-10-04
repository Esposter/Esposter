import type { CataloguedInstrument } from "#src/models/genshinAssets/CataloguedInstrument";
import type { SampledCandidate } from "#src/models/genshinAssets/SampledCandidate";
import type { SampledVoiceSolution } from "#src/models/genshinAssets/SampledVoiceSolution";
import type { NoteEventTime } from "pitch-transcription/notes";

import { SAMPLED_VOICE_REFINED_COUNT } from "#src/services/genshinAssets/constants";
import { readInstrumentRecordings } from "#src/services/genshinAssets/readInstrumentRecordings";
import { readVoicePitchReference } from "#src/services/genshinAssets/readVoicePitchReference";
import { refineVoicePowers } from "#src/services/genshinAssets/refineVoicePowers";
import { renderSampledVoice } from "#src/services/genshinAssets/renderSampledVoice";
import { solveVoicePowers } from "#src/services/genshinAssets/solveVoicePowers";
import { computeChroma } from "#src/services/genshinParity/computeChroma";
import { readAudibleFrames } from "#src/services/genshinParity/readAudibleFrames";
import { readBandEnergies } from "#src/services/genshinParity/readBandEnergies";
import { readBandFloor } from "#src/services/genshinParity/readBandFloor";
import { readFrameSeconds } from "#src/services/genshinParity/readFrameSeconds";
import { readGapsByOnsetAge } from "#src/services/genshinParity/readGapsByOnsetAge";
import { scoreShapedMusic } from "#src/services/genshinParity/scoreShapedMusic";
import { AUDIO_SAMPLE_RATE } from "pitch-transcription";

// Every combination of one candidate per voice, from `[]` up
const listCombinations = (counts: number[]): number[][] =>
  counts.reduce<number[][]>(
    (combinations, count) =>
      combinations.flatMap((combination) => Array.from({ length: count }, (_, index) => [...combination, index])),
    [[]],
  );
const readDot = (first: Float64Array, second: Float64Array): number =>
  first.reduce((sum, value, index) => sum + value * (second[index] ?? 0), 0);
// Each voice's instrument and level, solved together against the game's sound by the listening score's own measures.
// Every instrument plays each voice's notes alone at level 1, through the recordings they reach and with the release
// And tuning the game's voice was fitted to, and only one that keeps the voice's pitch as well as its notes as pure
// Tones do (`readVoicePitchReference`) is a candidate for it, or the one nearest that where none does: pitch is what
// The bands cannot hear. The game's sound is then read as the candidates' band energies summed, frame by frame over the
// Frames the score reads, each scaled by its power. For every combination of one candidate a voice, the powers come in
// Closed form from least squares in each band's share of the game's energy, which weighs a quiet frame as a loud one as
// The score's decibels do; the best combinations by that residual are refined against the score's band distance
// (`refineVoicePowers`), and each one's mix is scored whole once its expression follows the game's
// (`scoreShapedMusic`), as the shipped music's does, with its gaps by the time since a note began. The mixes are ranked
// By that distance
export const solveSampledVoices = async (
  catalogue: CataloguedInstrument[],
  voiceNotesList: NoteEventTime[][],
  voiceReleases: number[],
  voiceTunings: number[],
  game: Float32Array,
): Promise<SampledVoiceSolution[]> => {
  const frames = readAudibleFrames(computeChroma(game, AUDIO_SAMPLE_RATE).loudness);
  const frameTimes = frames.map((frame) => readFrameSeconds(frame, AUDIO_SAMPLE_RATE));
  const onsets = voiceNotesList.flat().map(({ startTimeSeconds }) => startTimeSeconds);
  const gameBands = readBandEnergies(game, AUDIO_SAMPLE_RATE);
  const floors = gameBands.map((energies) => readBandFloor(energies));
  const readFrameEnergies = (bands: Float64Array[]): Float64Array =>
    Float64Array.from({ length: bands.length * frames.length }, (_, index) => {
      const band = Math.floor(index / frames.length);
      return bands[band]?.[frames[index % frames.length] ?? 0] ?? 0;
    });
  const targets = readFrameEnergies(gameBands).map((energy, index) =>
    Math.max(energy, floors[Math.floor(index / frames.length)] ?? 0),
  );
  const references = voiceNotesList.map((voiceNotes, voice) =>
    readVoicePitchReference(voiceNotes, voiceReleases[voice] ?? 0, voiceTunings[voice] ?? 0, game.length),
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
      const { agreement } = reference.readSolo(rendered);
      const isCandidate = agreement >= reference.fundamentals.agreement;
      if (!isCandidate && agreement <= nearest.agreement) continue;
      const candidate = {
        energies: readFrameEnergies(readBandEnergies(rendered, AUDIO_SAMPLE_RATE)),
        instrument,
        rendered,
      };
      if (isCandidate) voiceCandidatesList[voice]?.push(candidate);
      else voiceNearestList[voice] = { agreement, candidate };
    }
  }
  const voiceKeptList = voiceCandidatesList.map((candidates, voice) => {
    const nearest = voiceNearestList[voice]?.candidate;
    return candidates.length > 0 || !nearest ? candidates : [nearest];
  });

  const readShares = (energies: Float64Array): Float64Array =>
    energies.map((energy, index) => energy / (targets[index] ?? 1));
  const voiceSharesList = voiceKeptList.map((candidates) => candidates.map(({ energies }) => readShares(energies)));
  // Every product the least squares reads, between any candidate of one voice and any of another, taken once
  const voiceProducts = voiceSharesList.map((rowSharesList) =>
    voiceSharesList.map((columnSharesList) =>
      rowSharesList.map((rowShares) => columnSharesList.map((columnShares) => readDot(rowShares, columnShares))),
    ),
  );
  const voiceSums = voiceSharesList.map((sharesList) =>
    sharesList.map((shares) => shares.reduce((sum, value) => sum + value, 0)),
  );
  const ranked = listCombinations(voiceSharesList.map((sharesList) => sharesList.length))
    .map((combination) => {
      const gram = combination.map((row, voice) =>
        combination.map((column, other) => voiceProducts[voice]?.[other]?.[row]?.[column] ?? 0),
      );
      const rhs = combination.map((index, voice) => voiceSums[voice]?.[index] ?? 0);
      const powers = solveVoicePowers(gram, rhs);
      // At the exact solution of the powers' subset, the residual is the negated product of its powers with the rhs
      const residual = -powers.reduce((sum, power, voice) => sum + power * (rhs[voice] ?? 0), 0);
      return { combination, powers, residual };
    })
    .toSorted((first, second) => first.residual - second.residual)
    .slice(0, SAMPLED_VOICE_REFINED_COUNT);

  return ranked
    .map(({ combination, powers }) => {
      const candidates = combination.flatMap((index, voice) => voiceKeptList[voice]?.[index] ?? []);
      const refined = refineVoicePowers(
        candidates.map(({ energies }) => energies),
        powers,
        targets,
        floors,
        frames.length,
      );
      const levels = refined.map((power) => Math.sqrt(power));
      const mix = new Float32Array(game.length);
      for (const [voice, { rendered }] of candidates.entries())
        for (const [index, sample] of rendered.entries())
          mix[index] = (mix[index] ?? 0) + (levels[voice] ?? 0) * sample;
      const shaped = scoreShapedMusic(mix, game, AUDIO_SAMPLE_RATE, frames);
      return {
        instruments: candidates.map(({ instrument }) => instrument),
        levels,
        onsetAgeGaps: readGapsByOnsetAge(shaped.bandLevelsList, frameTimes, onsets),
        shaped,
      };
    })
    .toSorted((first, second) => first.shaped.score.distance - second.shaped.score.distance);
};

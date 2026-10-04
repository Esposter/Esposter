import type { CataloguedInstrument } from "#src/models/genshinAssets/CataloguedInstrument";
import type { SampledVoiceSolution } from "#src/models/genshinAssets/SampledVoiceSolution";
import type { SampleRegion } from "#src/models/genshinAssets/SampleRegion";
import type { NoteEventTime } from "pitch-transcription/notes";

import { SAMPLED_VOICE_REFINE_STEPS, SAMPLED_VOICE_REFINED_COUNT } from "#src/services/genshinAssets/constants";
import { fetchSampleFile } from "#src/services/genshinAssets/fetchSampleFile";
import { readMixBandDistance } from "#src/services/genshinAssets/readMixBandDistance";
import { renderSampledVoice } from "#src/services/genshinAssets/renderSampledVoice";
import { solveVoicePowers } from "#src/services/genshinAssets/solveVoicePowers";
import { computeChroma } from "#src/services/genshinParity/computeChroma";
import { readAudibleFrames } from "#src/services/genshinParity/readAudibleFrames";
import { readAudioSamples } from "#src/services/genshinParity/readAudioSamples";
import { readBandEnergies } from "#src/services/genshinParity/readBandEnergies";
import { readBandFloor } from "#src/services/genshinParity/readBandFloor";
import { selectMusicSample } from "genshin-engine";
import { AUDIO_SAMPLE_RATE } from "pitch-transcription";

const readDot = (first: Float64Array, second: Float64Array): number =>
  first.reduce((sum, value, index) => sum + value * (second[index] ?? 0), 0);

// Every combination of one catalogued instrument per voice, from `[]` up
const listCombinations = (counts: number[]): number[][] =>
  counts.reduce<number[][]>(
    (combinations, count) =>
      combinations.flatMap((combination) => Array.from({ length: count }, (_, index) => [...combination, index])),
    [[]],
  );
// Each voice's instrument and level, solved together against the game's sound by the listening score's own measure:
// Each band's energy, frame by frame over the frames the score reads. Every instrument plays each voice's notes alone
// At level 1, through the recordings they reach and with the release and tuning the game's voice was fitted to, and
// The game's sound is read as the voices' energies summed, each scaled by its power. For every combination of one
// Instrument a voice, the powers come in closed form from least squares in each band's share of the game's energy,
// Which weighs a quiet frame as a loud one as the score's decibels do; the best combinations by that residual are then
// Refined, a voice's power halving its step each time no step moves the score's own distance down, and ranked by it
export const solveSampledVoices = async (
  catalogue: CataloguedInstrument[],
  voiceNotesList: NoteEventTime[][],
  voiceReleases: number[],
  voiceTunings: number[],
  game: Float32Array,
): Promise<SampledVoiceSolution[]> => {
  const frames = readAudibleFrames(computeChroma(game, AUDIO_SAMPLE_RATE).loudness);
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
  // Each voice's energies under each instrument, as shares of the game's
  const voiceEnergiesList: Float64Array[][] = voiceNotesList.map(() => []);
  for (const instrument of catalogue) {
    const regionSamplesMap = new Map<SampleRegion, Float32Array>();
    for (const { amplitude, pitchMidi } of voiceNotesList.flat()) {
      const region = selectMusicSample(instrument.regions, pitchMidi, amplitude);
      if (!region || regionSamplesMap.has(region)) continue;
      // oxlint-disable-next-line no-await-in-loop -- one instrument's recordings are held at a time
      const samplePath = await fetchSampleFile(instrument.library, region.path);
      // A region's offset is where its sound starts, so its recording is read from there
      // oxlint-disable-next-line no-await-in-loop -- as above
      const regionSamples = await readAudioSamples(samplePath, AUDIO_SAMPLE_RATE, region.offset);
      regionSamplesMap.set(region, regionSamples);
    }
    for (const [voice, voiceNotes] of voiceNotesList.entries()) {
      const rendered = renderSampledVoice(
        voiceNotes,
        instrument.regions,
        regionSamplesMap,
        voiceReleases[voice] ?? 0,
        voiceTunings[voice] ?? 0,
        AUDIO_SAMPLE_RATE,
        game.length,
      );
      const bands = readBandEnergies(rendered, AUDIO_SAMPLE_RATE);
      voiceEnergiesList[voice]?.push(readFrameEnergies(bands));
    }
  }

  const readShares = (energies: Float64Array): Float64Array =>
    energies.map((energy, index) => energy / (targets[index] ?? 1));
  const voiceSharesList = voiceEnergiesList.map((energiesList) => energiesList.map((energies) => readShares(energies)));
  // Every product the least squares reads, between any instrument of one voice and any of another, taken once
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
      const energies = combination.map((index, voice) => voiceEnergiesList[voice]?.[index] ?? new Float64Array());
      const readDistance = (candidate: number[]) =>
        readMixBandDistance(energies, candidate, targets, floors, frames.length);
      // A silenced voice starts its refinement from a thousandth of the loudest, where a step can move it
      let refined = powers.map((power) => Math.max(power, Math.max(...powers) / 1000));
      let distance = readDistance(refined);
      for (let step = 1; step >= 2 ** -SAMPLED_VOICE_REFINE_STEPS; step /= 2) {
        let isMoved = true;
        while (isMoved) {
          isMoved = false;
          for (const voice of refined.keys())
            for (const direction of [1, -1]) {
              const candidate = refined.map((power, index) =>
                index === voice ? power * 2 ** (direction * step) : power,
              );
              const candidateDistance = readDistance(candidate);
              if (candidateDistance >= distance) continue;
              refined = candidate;
              distance = candidateDistance;
              isMoved = true;
            }
        }
      }
      return {
        distance,
        instruments: combination.flatMap((index) => catalogue[index] ?? []),
        levels: refined.map((power) => Math.sqrt(power)),
      };
    })
    .toSorted((first, second) => first.distance - second.distance);
};

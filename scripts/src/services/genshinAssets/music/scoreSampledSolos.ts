import type { CataloguedInstrument } from "#src/models/genshinAssets/music/CataloguedInstrument";
import type { SampledSolo } from "#src/models/genshinAssets/music/SampledSolo";
import type { NoteEventTime } from "pitch-transcription/notes";

import { computeRecordingOnset } from "#src/services/genshinAssets/music/computeRecordingOnset";
import { computeVoicePitchReference } from "#src/services/genshinAssets/music/computeVoicePitchReference";
import { readInstrumentRecordings } from "#src/services/genshinAssets/music/readInstrumentRecordings";
import { renderSampledVoice } from "#src/services/genshinAssets/music/renderSampledVoice";
import { computeMedian } from "#src/services/genshinAssets/shared/computeMedian";
import { selectMusicSample } from "genshin-engine";
import { AUDIO_SAMPLE_RATE } from "pitch-transcription";

// Every catalogued instrument playing each voice's notes alone, scored by pitch agreement against the notes' own pitch
// Classes (`computeVoicePitchReference`): a loss every instrument shares lies in the render or the recordings, and one
// That moves with the instrument lies in its sound. Each voice's solos come best first, after the pure tones'
export const scoreSampledSolos = async (
  catalogue: CataloguedInstrument[],
  voiceNotesList: NoteEventTime[][],
  voiceReleases: number[],
  voiceTunings: number[],
  length: number,
): Promise<SampledSolo[][]> => {
  const references = voiceNotesList.map((voiceNotes, voice) =>
    computeVoicePitchReference(voiceNotes, voiceReleases[voice] ?? 0, voiceTunings[voice] ?? 0, length),
  );
  const voiceSolosList: SampledSolo[][] = voiceNotesList.map(() => []);
  for (const instrument of catalogue) {
    // oxlint-disable-next-line no-await-in-loop -- one instrument's recordings are held at a time
    const regionSamplesMap = await readInstrumentRecordings(instrument, voiceNotesList.flat());
    const regionOnsetMap = new Map(
      Array.from(regionSamplesMap, ([region, samples]) => [region, computeRecordingOnset(samples, AUDIO_SAMPLE_RATE)]),
    );
    for (const [voice, voiceNotes] of voiceNotesList.entries()) {
      const reference = references[voice];
      if (!reference) continue;
      const rendered = renderSampledVoice(
        voiceNotes,
        instrument.regions,
        regionSamplesMap,
        voiceReleases[voice] ?? 0,
        voiceTunings[voice] ?? 0,
        AUDIO_SAMPLE_RATE,
        length,
      );
      const regions = voiceNotes.flatMap(({ amplitude, pitchMidi }) => {
        const region = selectMusicSample(instrument.regions, pitchMidi, amplitude);
        return region ? [{ pitchMidi, region }] : [];
      });
      voiceSolosList[voice]?.push({
        ...reference.computeSolo(rendered),
        name: instrument.name,
        onset: computeMedian(regions.map(({ region }) => regionOnsetMap.get(region) ?? 0)),
        shift: computeMedian(regions.map(({ pitchMidi, region }) => Math.abs(pitchMidi - region.keyCenter))),
      });
    }
  }
  return references.map(({ fundamentals }, voice) => {
    const solos = (voiceSolosList[voice] ?? []).toSorted(
      (firstSolo, secondSolo) => secondSolo.agreement - firstSolo.agreement,
    );
    solos.unshift(fundamentals);
    return solos;
  });
};

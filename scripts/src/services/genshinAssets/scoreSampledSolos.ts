import type { CataloguedInstrument } from "#src/models/genshinAssets/CataloguedInstrument";
import type { SampledSolo } from "#src/models/genshinAssets/SampledSolo";
import type { NoteEventTime } from "pitch-transcription/notes";

import { readInstrumentRecordings } from "#src/services/genshinAssets/readInstrumentRecordings";
import { readMedian } from "#src/services/genshinAssets/readMedian";
import { readRecordingOnset } from "#src/services/genshinAssets/readRecordingOnset";
import { readVoicePitchReference } from "#src/services/genshinAssets/readVoicePitchReference";
import { renderSampledVoice } from "#src/services/genshinAssets/renderSampledVoice";
import { selectMusicSample } from "genshin-engine";
import { AUDIO_SAMPLE_RATE } from "pitch-transcription";

// Every catalogued instrument playing each voice's notes alone, scored by pitch agreement against the notes' own pitch
// Classes (`readVoicePitchReference`): a loss every instrument shares lies in the render or the recordings, and one
// That moves with the instrument lies in its sound. Each voice's solos come best first, after the pure tones'
export const scoreSampledSolos = async (
  catalogue: CataloguedInstrument[],
  voiceNotesList: NoteEventTime[][],
  voiceReleases: number[],
  voiceTunings: number[],
  length: number,
): Promise<SampledSolo[][]> => {
  const references = voiceNotesList.map((voiceNotes, voice) =>
    readVoicePitchReference(voiceNotes, voiceReleases[voice] ?? 0, voiceTunings[voice] ?? 0, length),
  );
  const voiceSolosList: SampledSolo[][] = voiceNotesList.map(() => []);
  for (const instrument of catalogue) {
    // oxlint-disable-next-line no-await-in-loop -- one instrument's recordings are held at a time
    const regionSamplesMap = await readInstrumentRecordings(instrument, voiceNotesList.flat());
    const regionOnsetMap = new Map(
      Array.from(regionSamplesMap, ([region, samples]) => [region, readRecordingOnset(samples, AUDIO_SAMPLE_RATE)]),
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
        ...reference.readSolo(rendered),
        name: instrument.name,
        onset: readMedian(regions.map(({ region }) => regionOnsetMap.get(region) ?? 0)),
        shift: readMedian(regions.map(({ pitchMidi, region }) => Math.abs(pitchMidi - region.keyCenter))),
      });
    }
  }
  return references.map(({ fundamentals }, voice) => {
    const solos = (voiceSolosList[voice] ?? []).toSorted((first, second) => second.agreement - first.agreement);
    solos.unshift(fundamentals);
    return solos;
  });
};

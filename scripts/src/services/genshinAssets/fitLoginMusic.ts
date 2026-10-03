import type { ComponentPlaylist } from "#src/models/genshinAssets/ComponentPlaylist";
import type { Instrument, Music, MusicSegment } from "genshin-engine";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import { computeSpectrogram } from "#src/services/genshinAssets/computeSpectrogram";
import {
  MUSIC_DECIMALS,
  MUSIC_FRAME_LENGTH,
  MUSIC_HOP_LENGTH,
  MUSIC_VOICE_COUNT,
} from "#src/services/genshinAssets/constants";
import { fitInstrument } from "#src/services/genshinAssets/fitInstrument";
import { fitVoiceNoises } from "#src/services/genshinAssets/fitVoiceNoises";
import { getComponentDirectory } from "#src/services/genshinAssets/getComponentDirectory";
import { readMusicSourceNotes } from "#src/services/genshinAssets/readMusicSourceNotes";
import { splitVoicesByRegister } from "#src/services/genshinAssets/splitVoicesByRegister";
import { readAudioSamples } from "#src/services/genshinParity/readAudioSamples";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { AUDIO_SAMPLE_RATE } from "pitch-transcription";

const roundMusic = (value: number): number => Number(value.toFixed(MUSIC_DECIMALS));
const roundInstrument = ({
  attack,
  decay,
  harmonics,
  level,
  noise,
  release,
  sustain,
  tuning,
}: Instrument): Instrument => ({
  attack: roundMusic(attack),
  decay: roundMusic(decay),
  harmonics: harmonics.map(roundMusic),
  level: roundMusic(level),
  noise: roundMusic(noise),
  release: roundMusic(release),
  sustain: roundMusic(sustain),
  tuning: roundMusic(tuning),
});
// The login's music as our own: its playlist as `playlist` exported it, each segment's sources transcribed, their notes
// Split by register into voices, and each voice's instrument fitted to the source it was heard in, the voices' noise
// Solved together since no note sounds alone. A clip's notes move
// Into its segment's time, where its source starts at `playAt`, and only what its trims leave plays. Each voice's fit
// Is reported with its measurements and residuals
export const fitLoginMusic = async (): Promise<{ music: Music; report: string[] }> => {
  const { music: directory } = getComponentDirectory(DerivedAssetComponent.Login);
  const { isLooping, order, segments } = parseMachineJson<ComponentPlaylist>(
    await readFile(join(directory, "playlist.json"), "utf8"),
  );
  const report: string[] = [];
  const musicSegments: MusicSegment[] = [];
  for (const { clips, duration, id } of segments) {
    const voices: MusicSegment["voices"] = [];
    for (const { beginTrim, duration: sourceDuration, endTrim, playAt, sourceId } of clips) {
      const wavePath = join(directory, `${sourceId}.wav`);
      // oxlint-disable-next-line no-await-in-loop -- one source's samples and spectrum are held at a time
      const samples = await readAudioSamples(wavePath, AUDIO_SAMPLE_RATE);
      // oxlint-disable-next-line no-await-in-loop -- as above
      const notes = await readMusicSourceNotes(wavePath, samples);
      const spectrogram = computeSpectrogram(samples, AUDIO_SAMPLE_RATE, MUSIC_FRAME_LENGTH, MUSIC_HOP_LENGTH);
      const splits = splitVoicesByRegister(
        notes.map(({ pitchMidi }) => pitchMidi),
        MUSIC_VOICE_COUNT,
      );
      report.push(`segment ${id}, source ${sourceId}: ${notes.length} notes, registers split at ${splits.join(", ")}`);
      const clipStart = beginTrim / 1000;
      const clipEnd = (sourceDuration + endTrim) / 1000;
      const voiceNotesList = [-Infinity, ...splits].map((lowest, voice) =>
        notes.filter(({ pitchMidi }) => pitchMidi >= lowest && pitchMidi < (splits[voice] ?? Infinity)),
      );
      const noises = fitVoiceNoises(spectrogram, voiceNotesList);
      for (const [voice, voiceNotes] of voiceNotesList.entries()) {
        const { decayResidual, harmonicCounts, instrument, noteCount, releaseCount, releaseResidual } = fitInstrument(
          spectrogram,
          voiceNotes,
          notes,
        );
        const noise = noises[voice] ?? 0;
        report.push(
          `  voice ${voice}: ${voiceNotes.length} notes, ${noteCount} clear; harmonics ${instrument.harmonics.map((amplitude, index) => `${amplitude.toFixed(3)} (${harmonicCounts[index]})`).join(", ")}; attack ${instrument.attack.toFixed(3)} s, decay ${instrument.decay.toFixed(3)} s to ${instrument.sustain.toFixed(3)} (residual ${decayResidual.toFixed(3)}), release ${instrument.release.toFixed(3)} s from ${releaseCount} notes (residual ${releaseResidual.toFixed(3)}), level ${instrument.level.toFixed(4)}, noise ${noise.toFixed(4)}, tuning ${(instrument.tuning * 100).toFixed(1)} cents`,
        );
        voices.push({
          instrument: roundInstrument({ ...instrument, noise }),
          notes: voiceNotes
            .filter(({ startTimeSeconds }) => startTimeSeconds >= clipStart && startTimeSeconds < clipEnd)
            .map(({ amplitude, durationSeconds, pitchMidi, startTimeSeconds }) => ({
              duration: roundMusic(Math.min(durationSeconds, clipEnd - startTimeSeconds)),
              pitch: pitchMidi,
              start: roundMusic(playAt / 1000 + startTimeSeconds),
              velocity: roundMusic(amplitude),
            }))
            .toSorted((first, second) => first.start - second.start),
        });
      }
    }
    musicSegments.push({ duration: roundMusic(duration / 1000), voices });
  }
  return { music: { isLooping, order, segments: musicSegments }, report };
};

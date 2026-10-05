import type { ComponentPlaylist } from "#src/models/genshinAssets/shared/ComponentPlaylist";
import type { Instrument, Music, MusicSegment } from "genshin-engine";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { computeSpectrogram } from "#src/services/genshinAssets/shared/computeSpectrogram";
import { fitMusicVoices } from "#src/services/genshinAssets/shared/fitMusicVoices";
import { fitVoiceNoises } from "#src/services/genshinAssets/shared/fitVoiceNoises";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readMusicSourceNotes } from "#src/services/genshinAssets/shared/readMusicSourceNotes";
import { roundMusic } from "#src/services/genshinAssets/shared/roundMusic";
import { CHROMA_FRAME_LENGTH, CHROMA_HOP_LENGTH } from "#src/services/genshinParity/shared/constants";
import { readAudioSamples } from "#src/services/genshinParity/shared/readAudioSamples";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { AUDIO_SAMPLE_RATE } from "pitch-transcription";

const roundInstrument = ({
  attack,
  decay,
  harmonics,
  level,
  noiseBands,
  release,
  sustain,
  tuning,
}: Instrument): Instrument => ({
  attack: roundMusic(attack),
  decay: roundMusic(decay),
  harmonics: harmonics.map((harmonic) => roundMusic(harmonic)),
  level: roundMusic(level),
  noiseBands: noiseBands.map((noiseBand) => roundMusic(noiseBand)),
  release: roundMusic(release),
  sustain: roundMusic(sustain),
  tuning: roundMusic(tuning),
});
// The login's music as our own: its playlist as `playlist` exported it, each segment's sources transcribed, their notes
// Split by register into voices, each voice's instrument fitted to the source it was heard in (`fitMusicVoices`), and
// The voices' noise solved together since no note sounds alone. A clip's notes move into its segment's time, where its
// Source starts at `playAt`, and only what its trims leave plays. Each voice's fit is reported with its measurements
// And residuals
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
      const { splits, voiceFits, voiceNotesList } = fitMusicVoices(samples, notes);
      report.push(`segment ${id}, source ${sourceId}: ${notes.length} notes, registers split at ${splits.join(", ")}`);
      const clipStart = beginTrim / 1000;
      const clipEnd = (sourceDuration + endTrim) / 1000;
      // The voices' noise is solved in the listening score's own frames, whose finer bins tell a tonal band from a
      // Noisy one as the score and `genshin:parity bands` do, and give the lowest band bins enough to read between its
      // Notes
      const noiseSpectrogram = computeSpectrogram(samples, AUDIO_SAMPLE_RATE, CHROMA_FRAME_LENGTH, CHROMA_HOP_LENGTH);
      const { flatnesses, levels: noises } = fitVoiceNoises(noiseSpectrogram, voiceNotesList);
      report.push(`  flatness by band ${flatnesses.map((flatness) => flatness.toFixed(3)).join(", ")}`);
      for (const [voice, voiceNotes] of voiceNotesList.entries()) {
        const voiceFit = voiceFits[voice];
        if (!voiceFit) continue;
        const { decayResidual, harmonicCounts, instrument, noteCount, releaseCount, releaseResidual } = voiceFit;
        const noiseBands = noises[voice] ?? [];
        report.push(
          `  voice ${voice}: ${voiceNotes.length} notes, ${noteCount} clear; harmonics ${instrument.harmonics.map((amplitude, index) => `${amplitude.toFixed(3)} (${harmonicCounts[index]})`).join(", ")}; attack ${instrument.attack.toFixed(3)} s, decay ${instrument.decay.toFixed(3)} s to ${instrument.sustain.toFixed(3)} (residual ${decayResidual.toFixed(1)} dB), release ${instrument.release.toFixed(3)} s from ${releaseCount} notes (residual ${releaseResidual.toFixed(3)}), level ${instrument.level.toFixed(4)}, noise by band ${noiseBands.map((level) => level.toFixed(4)).join(", ")}, tuning ${(instrument.tuning * 100).toFixed(1)} cents`,
        );
        voices.push({
          instrument: roundInstrument({ ...instrument, noiseBands }),
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
    // A segment's expression is fitted afterwards, against our render of these voices (`genshin:parity expression`)
    musicSegments.push({ duration: roundMusic(duration / 1000), expression: [], voices });
  }
  return { music: { isLooping, order, segments: musicSegments }, report };
};

import type { Instrument } from "#src/models/audio/Instrument";
import type { MusicNote } from "#src/models/audio/MusicNote";

import { RELEASE_TIME_CONSTANTS } from "#src/audio/constants";
import { getMusicRecordingGain } from "#src/audio/getMusicRecordingGain";
import { getMusicRecordingRate } from "#src/audio/getMusicRecordingRate";
import { selectMusicSample } from "#src/audio/selectMusicSample";

// One note's recording played at a time on the audio clock, over its synthesized note: the recording `selectMusicSample`
// Picks, from its decoded buffer by file, read at the rate that shifts it to the note's pitch as the instrument tunes
// It, at the voice's recording level and the note's velocity, held to the note's end and then faded with the
// Instrument's release, until its buffer runs out. A voice with no recordings, or one whose buffer has not been
// Decoded, plays nothing here
export const scheduleMusicRecording = (
  context: BaseAudioContext,
  destination: AudioNode,
  recordingBufferMap: ReadonlyMap<string, AudioBuffer>,
  { recordingLevel, recordings, release, tuning }: Instrument,
  { duration, pitch, velocity }: MusicNote,
  time: number,
): void => {
  const recording = selectMusicSample(recordings, pitch, velocity);
  const buffer = recording && recordingBufferMap.get(recording.file);
  if (!recording || !buffer) return;
  const end = time + duration;
  const source = new AudioBufferSourceNode(context, {
    buffer,
    playbackRate: getMusicRecordingRate(recording, pitch, tuning),
  });
  const gain = new GainNode(context, { gain: 0 });
  gain.gain.setValueAtTime(recordingLevel * getMusicRecordingGain(recording, velocity), time);
  gain.gain.setTargetAtTime(0, end, release);
  source.connect(gain).connect(destination);
  source.addEventListener("ended", () => {
    gain.disconnect();
  });
  source.start(time);
  source.stop(end + release * RELEASE_TIME_CONSTANTS);
};

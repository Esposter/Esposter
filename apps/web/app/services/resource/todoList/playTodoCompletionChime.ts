import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import {
  TODO_COMPLETION_CHIME_FREQUENCIES_HZ,
  TODO_COMPLETION_CHIME_GAIN,
  TODO_COMPLETION_CHIME_NOTE_GAP_SECONDS,
  TODO_COMPLETION_CHIME_RING_SECONDS,
} from "@/services/resource/constants";
import { getResult, getResultAsync, noop } from "@esposter/shared";

const closeAudioContext = getSynchronizedFunction((audioContext: AudioContext) =>
  getResultAsync(() => audioContext.close()).match(noop, console.error),
);

const scheduleNotes = (audioContext: AudioContext) =>
  TODO_COMPLETION_CHIME_FREQUENCIES_HZ.map((frequency, index) => {
    const startTime = audioContext.currentTime + index * TODO_COMPLETION_CHIME_NOTE_GAP_SECONDS;
    const endTime = startTime + TODO_COMPLETION_CHIME_RING_SECONDS;
    const gain = new GainNode(audioContext);
    // The fade runs from the note's own start, since a ramp with no event before it would start from now
    gain.gain.setValueAtTime(TODO_COMPLETION_CHIME_GAIN, startTime);
    gain.gain.exponentialRampToValueAtTime(Number.EPSILON, endTime);
    gain.connect(audioContext.destination);
    const oscillator = new OscillatorNode(audioContext, { frequency });
    oscillator.connect(gain);
    oscillator.start(startTime);
    oscillator.stop(endTime);
    return oscillator;
  });
// Synthesized rather than a sound file, so the chime costs no download; each tick gets a context of its own, closed
// Once its last note has rung, so no context outlives the sound it plays. The chime is best-effort: a browser that
// Refuses the context or a note logs the error and the completion goes ahead without it
export const playTodoCompletionChime = () => {
  getResult(() => new AudioContext()).match((audioContext) => {
    getResult(() => scheduleNotes(audioContext)).match(
      (oscillators) => {
        const lastOscillator = oscillators.at(-1);
        if (!lastOscillator) return;
        lastOscillator.addEventListener(
          "ended",
          () => {
            closeAudioContext(audioContext);
          },
          { once: true },
        );
      },
      (error) => {
        console.error(error);
        closeAudioContext(audioContext);
      },
    );
  }, console.error);
};

import {
  TODO_COMPLETION_CHIME_FREQUENCIES_HZ,
  TODO_COMPLETION_CHIME_GAIN,
  TODO_COMPLETION_CHIME_NOTE_GAP_SECONDS,
  TODO_COMPLETION_CHIME_RING_SECONDS,
} from "@/services/resource/constants";

// Synthesized rather than a sound file, so the chime costs no download; each tick gets a context of its own, closed
// Once its last note has rung, so no context outlives the sound it plays
export const playTodoCompletionChime = () => {
  const audioContext = new AudioContext();
  const oscillators = TODO_COMPLETION_CHIME_FREQUENCIES_HZ.map((frequency, index) => {
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
  const lastOscillator = oscillators.at(-1);
  if (!lastOscillator) return;
  lastOscillator.addEventListener("ended", () => audioContext.close(), { once: true });
};

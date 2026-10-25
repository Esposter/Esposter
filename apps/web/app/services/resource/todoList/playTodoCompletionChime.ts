import { closeAudioContext } from "@/services/resource/todoList/closeAudioContext";
import { scheduleNotes } from "@/services/resource/todoList/scheduleNotes";
import { getResult } from "@esposter/shared";

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

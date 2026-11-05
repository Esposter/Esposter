import { WORLD_RANDOM_SEED } from "#src/services/constants";
import { SCRIPTED_FRAME_MS, SCRIPTED_START_MS } from "#src/services/dev/constants";
import { createSeededRandom } from "genshin-engine";
import { vi } from "vitest";

// Fakes the frame clock, its timers, its performance clock and `Temporal.Now`, and seeds `Math.random`, so a scripted run
// Reads the same instants and draws the same values each time it runs. The clock moves only when a frame steps it, by one
// Fixed step, and `dispose` puts back every one it replaced
export const createScriptedClock = () => {
  vi.useFakeTimers({
    // Node has no frame clock, so there its timers and clocks alone are faked; a browser's frame clock is faked with them
    ignoreMissingTimers: true,
    now: SCRIPTED_START_MS,
    toFake: ["setTimeout", "requestAnimationFrame", "cancelAnimationFrame", "performance", "Temporal"],
  });
  const randomSpy = vi.spyOn(Math, "random").mockImplementation(createSeededRandom(WORLD_RANDOM_SEED));
  return {
    dispose: () => {
      randomSpy.mockRestore();
      vi.useRealTimers();
    },
    stepFrame: () => {
      vi.advanceTimersByTime(SCRIPTED_FRAME_MS);
    },
  };
};

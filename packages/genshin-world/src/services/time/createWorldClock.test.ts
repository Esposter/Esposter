import { describe } from "vitest";
import { shallowRef } from "vue";

// A world clock a test moves on: getWorldNow reads the moment with no reactive dependency, as the session's does, and
// WorldNow is the ref a computed reads, which the session's clock moves on a minute at a time
export const createWorldClock = (start: Temporal.Instant) => {
  let now = start;
  const worldNow = shallowRef(start);
  return {
    getWorldNow: () => now,
    moveTo: (next: Temporal.Instant) => {
      now = next;
      worldNow.value = next;
    },
    worldNow,
  };
};

describe.todo("createWorldClock");

import { WORLD_CLOCK_INTERVAL_MS } from "#src/services/time/constants";
import { getServerNow } from "#src/services/time/getServerNow";
import { useIntervalFn } from "@vueuse/core";
import { shallowRef } from "vue";

// The world's time: every saved timer is read against the server's clock, which this machine's own runs behind or ahead of
// By the offset
export const useWorldClock = (serverClockOffsetMs: number) => {
  const getWorldNow = () => getServerNow(serverClockOffsetMs);
  // The world's clock as a ref the computeds read, set from getWorldNow once each game minute so a reset or a regeneration that
  // Passes is seen without a write
  const worldNow = shallowRef(getWorldNow());
  useIntervalFn(() => {
    worldNow.value = getWorldNow();
  }, WORLD_CLOCK_INTERVAL_MS);
  return { getWorldNow, worldNow };
};

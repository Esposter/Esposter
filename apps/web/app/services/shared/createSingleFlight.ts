import { withFinalizerAsync } from "@esposter/shared";

// Runs one call at a time. A call made while one is in flight starts nothing: it only marks that another run is owed,
// And every call made meanwhile is that one run, started once the run in flight settles, so it reads the state as it is
// Then. A run that rejects rejects the call that started it, and clears the flight so the next call can run
export const createSingleFlight = (run: () => Promise<void>) => {
  let isInFlight = false;
  let isOwed = false;
  const flush = async (): Promise<void> => {
    if (isInFlight) {
      isOwed = true;
      return;
    }

    isInFlight = true;
    isOwed = false;
    await withFinalizerAsync(run, () => {
      isInFlight = false;
    });
    // Checked once the flight is clear, so a call made in between starts its own run, and whatever it leaves owed is
    // Taken by that run's own check
    if (isOwed) await flush();
  };
  return flush;
};

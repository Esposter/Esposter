import { getResultAsync, noop, withFinalizerAsync } from "@esposter/shared";

// Runs one call at a time. A call made while one is in flight starts nothing of its own: it joins the one run owed after
// The flight, and settles only once that run has settled, so it reads the state as it is then. Every call made meanwhile
// Joins that same run. A run that rejects rejects the call that started it and clears the flight, and the run owed after
// It still starts, so the calls that joined it are not left waiting on a flight that will never settle them
export const createSingleFlight = (run: () => Promise<void>) => {
  let isInFlight = false;
  let owed: PromiseWithResolvers<void> | undefined;
  const flush = async (): Promise<void> => {
    if (isInFlight) {
      owed ??= Promise.withResolvers<void>();
      return owed.promise;
    }

    isInFlight = true;
    const flight = await getResultAsync(() =>
      withFinalizerAsync(run, () => {
        isInFlight = false;
      }),
    );
    // Checked once the flight is clear, so a call made in between starts its own run, and whatever it leaves owed is
    // Taken by that run's own check
    if (owed) {
      const { reject, resolve } = owed;
      owed = undefined;
      await getResultAsync(flush).match(resolve, reject);
    }
    flight.match(noop, (error) => {
      throw error;
    });
  };
  return flush;
};

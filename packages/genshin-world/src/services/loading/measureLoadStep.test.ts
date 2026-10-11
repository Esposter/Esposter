import { LOAD_STEP_MEASURE_PREFIX } from "#src/services/loading/constants";
import { measureLoadStep } from "#src/services/loading/measureLoadStep";
import { describe, expect, test } from "vitest";

const VALUE = 1;
const MESSAGE = "failed";

// The details of the measures a step of this name left in the browser's own entries
const getMeasureDetails = (name: string) =>
  performance
    .getEntriesByName(`${LOAD_STEP_MEASURE_PREFIX}${name}`, "measure")
    .filter((entry) => entry instanceof PerformanceMeasure)
    .map(({ detail }) => detail);

describe(measureLoadStep, () => {
  test("keeps a resolved step's result and measures it", async () => {
    expect.hasAssertions();
    const name = "resolved";
    await expect(measureLoadStep(name, Promise.resolve(VALUE))).resolves.toBe(VALUE);
    expect(getMeasureDetails(name)).toStrictEqual([null]);
  });

  test("keeps a rejected step's rejection, and measures it as failed", async () => {
    expect.hasAssertions();
    const name = "rejected";
    const error = new Error(MESSAGE);
    await expect(measureLoadStep(name, Promise.reject(error))).rejects.toBe(error);
    expect(getMeasureDetails(name)).toStrictEqual([{ isFailed: true }]);
  });
});

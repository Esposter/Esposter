import { computeInputLevelDecibels } from "@/services/message/room/call/computeInputLevelDecibels";
import { MIN_INPUT_SENSITIVITY_DECIBELS } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(computeInputLevelDecibels, () => {
  test("reads silence as the floor of the scale", () => {
    expect.hasAssertions();

    expect(computeInputLevelDecibels(new Float32Array(1))).toBe(MIN_INPUT_SENSITIVITY_DECIBELS);
  });

  test("reads a full-scale frame as zero decibels", () => {
    expect.hasAssertions();

    expect(computeInputLevelDecibels(new Float32Array([1, -1]))).toBe(0);
  });
});

import { sliceBetweenMarkers } from "#src/services/exec/wsl/sliceBetweenMarkers";
import { describe, expect, test } from "vitest";

describe(sliceBetweenMarkers, () => {
  const begin = "<begin>";
  const end = "<end>";
  const value = "captured";

  test("returns the value between the markers, ignoring surrounding shell noise", () => {
    expect.hasAssertions();

    expect(sliceBetweenMarkers(`motd\n${begin}${value}${end}trailing`, begin, end)).toBe(value);
  });

  test("returns an empty value when a marker is missing", () => {
    expect.hasAssertions();

    expect(sliceBetweenMarkers(`${begin}${value}`, begin, end)).toBe("");
  });

  test("returns an empty value rather than a truncated one when the markers are inverted", () => {
    expect.hasAssertions();

    expect(sliceBetweenMarkers(`${end}${value}${begin}`, begin, end)).toBe("");
  });

  test("returns the value when the end marker also appears in the noise before the begin marker", () => {
    expect.hasAssertions();

    expect(sliceBetweenMarkers(`${end}motd\n${begin}${value}${end}`, begin, end)).toBe(value);
  });
});

import { describe, expect, test } from "vitest";

import { takeWatcherLines } from "./takeWatcherLines";

describe(takeWatcherLines, () => {
  test("takes every whole line of a chunk and holds the rest", () => {
    expect.hasAssertions();

    expect(takeWatcherLines("", "machine idle: a\nmachine tight: b\npart")).toStrictEqual({
      lines: ["machine idle: a", "machine tight: b"],
      pending: "part",
    });
  });

  test("completes a line held from the chunk before", () => {
    expect.hasAssertions();

    expect(takeWatcherLines("machine ", "idle: a\n")).toStrictEqual({ lines: ["machine idle: a"], pending: "" });
  });
});

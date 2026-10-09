import type { FrameSample } from "#src/models/genshinParity/shared/FrameSample";

import { summarizeStallState } from "#src/services/genshinParity/shared/summarizeStallState";
import { describe, expect, test } from "vitest";

const STATE_NAME = "orbit";
const FRAME_MS = 16;
const SLOW_FRAME_MS = 60;
const STALLED_FRAME_MS = 300;
const PROGRAMS = 73;

describe(summarizeStallState, () => {
  test("counts the gaps between frames, not the first frame of the state", () => {
    expect.hasAssertions();

    const frames: FrameSample[] = [
      { programs: PROGRAMS, time: 0 },
      { programs: PROGRAMS, time: FRAME_MS },
      { programs: PROGRAMS, time: FRAME_MS + SLOW_FRAME_MS },
      { programs: PROGRAMS, time: FRAME_MS + SLOW_FRAME_MS + STALLED_FRAME_MS },
    ];

    expect(summarizeStallState(STATE_NAME, frames, PROGRAMS, PROGRAMS)).toStrictEqual({
      frames: 3,
      growthAt: [],
      maxFrameMs: STALLED_FRAME_MS,
      name: STATE_NAME,
      over50: 2,
      over250: 1,
      programsAfter: PROGRAMS,
      programsBefore: PROGRAMS,
    });
  });

  test("places each growth of the programs at its frame's time from the state's start", () => {
    expect.hasAssertions();

    const GROWN_PROGRAMS = 79;
    const frames: FrameSample[] = [
      { programs: PROGRAMS, time: 0 },
      { programs: PROGRAMS, time: FRAME_MS },
      { programs: GROWN_PROGRAMS, time: FRAME_MS * 2 },
    ];

    expect(summarizeStallState(STATE_NAME, frames, PROGRAMS, GROWN_PROGRAMS).growthAt).toStrictEqual([
      { atMs: FRAME_MS * 2, programs: GROWN_PROGRAMS },
    ]);
  });

  test("places no growth at a frame whose programs fell", () => {
    expect.hasAssertions();

    const RELEASED_PROGRAMS = 70;
    const frames: FrameSample[] = [
      { programs: PROGRAMS, time: 0 },
      { programs: RELEASED_PROGRAMS, time: FRAME_MS },
    ];

    expect(summarizeStallState(STATE_NAME, frames, PROGRAMS, RELEASED_PROGRAMS).growthAt).toStrictEqual([]);
  });

  test("reports no frames for a state that drew none", () => {
    expect.hasAssertions();

    expect(summarizeStallState(STATE_NAME, [], null, null)).toStrictEqual({
      frames: 0,
      growthAt: [],
      maxFrameMs: 0,
      name: STATE_NAME,
      over50: 0,
      over250: 0,
      programsAfter: null,
      programsBefore: null,
    });
  });
});

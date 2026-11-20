import type { GridEngine } from "#src/models/GridEngine";
import type { GridEngineConfig } from "#src/models/GridEngineConfig";
import type { GridEngineError } from "#src/models/GridEngineError";
import type { Result } from "neverthrow";

import { Direction } from "#src/models/Direction";
import { createGridEngine } from "#src/services/createGridEngine";
import { describe, expect, test } from "vitest";

// A failed call is a value, so a test that needs the call to succeed reports the failure as an assertion
const unwrap = <T>(result: Result<T, GridEngineError>): T =>
  result.match(
    (value) => value,
    (error) => expect.fail(`the call failed with ${error.kind}`),
  );

const readEngine = (config: GridEngineConfig): GridEngine => unwrap(createGridEngine(config));

describe(createGridEngine, () => {
  const FIRST_ID = "0";
  const SECOND_ID = "1";
  const STEP_DURATION_MS = 250;

  test("a blocking tile blocks", () => {
    expect.hasAssertions();

    const engine = readEngine({ tiles: [[true, false]] });

    expect(engine.checkIsBlocked({ x: 0, y: 0 })).toBe(true);
    expect(engine.checkIsBlocked({ x: 1, y: 0 })).toBe(false);
  });

  test("a position with no tile blocks", () => {
    expect.hasAssertions();

    const engine = readEngine({ tiles: [[undefined, false]] });

    expect(engine.checkIsBlocked({ x: 0, y: 0 })).toBe(true);
    expect(engine.checkIsBlocked({ x: 1, y: 0 })).toBe(false);
  });

  test("a position outside the grid blocks", () => {
    expect.hasAssertions();

    const engine = readEngine({ tiles: [[false]] });

    expect(engine.checkIsBlocked({ x: 0, y: 0 })).toBe(false);
    expect(engine.checkIsBlocked({ x: 1, y: 0 })).toBe(true);
    expect(engine.checkIsBlocked({ x: -1, y: 0 })).toBe(true);
    expect(engine.checkIsBlocked({ x: 0, y: 1 })).toBe(true);
  });

  test("a moving character blocks the tile it has left until it has left", () => {
    expect.hasAssertions();

    const engine = readEngine({ characters: [{ id: FIRST_ID }], tiles: [[false, false]] });
    unwrap(engine.move(FIRST_ID, Direction.Right));

    engine.update(STEP_DURATION_MS / 2);
    expect(engine.checkIsBlocked({ x: 0, y: 0 })).toBe(true);

    engine.update(STEP_DURATION_MS);
    expect(engine.checkIsBlocked({ x: 0, y: 0 })).toBe(false);
  });

  test("characters block each other", () => {
    expect.hasAssertions();

    const engine = readEngine({
      characters: [{ id: FIRST_ID }, { id: SECOND_ID, startPosition: { x: 1, y: 0 } }],
      tiles: [[false, false]],
    });
    unwrap(engine.move(FIRST_ID, Direction.Right));

    engine.update(STEP_DURATION_MS);
    expect(engine.checkIsBlocked({ x: 0, y: 0 })).toBe(true);
  });

  test("isBlocked is true on a tile another character occupies (#213)", () => {
    expect.hasAssertions();

    const engine = readEngine({
      characters: [{ id: FIRST_ID }, { id: SECOND_ID, startPosition: { x: 1, y: 0 } }],
      tiles: [[false, false, false]],
    });

    expect(engine.checkIsBlocked({ x: 1, y: 0 })).toBe(true);
    expect(engine.checkIsBlocked({ x: 2, y: 0 })).toBe(false);
  });
});

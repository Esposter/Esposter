import type { GridEngine } from "#src/models/GridEngine";
import type { GridEngineConfig } from "#src/models/GridEngineConfig";
import type { GridEngineError } from "#src/models/GridEngineError";
import type { Position } from "#src/models/Position";
import type { Result } from "neverthrow";

import { Direction } from "#src/models/Direction";
import { GridEngineErrorKind } from "#src/models/GridEngineErrorKind";
import { createGridEngine } from "#src/services/createGridEngine";
import { describe, expect, test } from "vitest";

// A failed call is a value, so a test that needs the call to succeed reports the failure as an assertion
const unwrap = <T>(result: Result<T, GridEngineError>): T =>
  result.match(
    (value) => value,
    (error) => expect.fail(`the call failed with ${error.kind}`),
  );

// The mirror of `unwrap`: a test that needs the call to fail reads the error it returned
const readError = <T>(result: Result<T, GridEngineError>): GridEngineError =>
  result.match(
    () => expect.fail("the call succeeded"),
    (error) => error,
  );

const readEngine = (config: GridEngineConfig): GridEngine => unwrap(createGridEngine(config));

describe(createGridEngine, () => {
  const FIRST_ID = "0";
  const SECOND_ID = "1";
  const STEP_DURATION_MS = 1000 / 4;
  const ONE_SECOND_MS = 1000;

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

  test("a step takes the same time at any split of one second of updates (#419)", () => {
    expect.hasAssertions();

    // Each split divides a step evenly, so the tile is released on the update that crosses its end
    for (const splitMs of [1, 5, 10, 25, 50, 125, STEP_DURATION_MS]) {
      const engine = readEngine({ characters: [{ id: FIRST_ID }], tiles: [[false, false]] });
      unwrap(engine.move(FIRST_ID, Direction.Right));

      let elapsedMs = 0;
      while (elapsedMs < ONE_SECOND_MS && engine.checkIsBlocked({ x: 0, y: 0 })) {
        engine.update(splitMs);
        elapsedMs += splitMs;
      }
      expect(elapsedMs).toBe(STEP_DURATION_MS);
    }
  });

  test("the default speed is four tiles per second", () => {
    expect.hasAssertions();

    const engine = readEngine({ characters: [{ id: FIRST_ID }], tiles: [[false, false]] });
    unwrap(engine.move(FIRST_ID, Direction.Right));

    engine.update(STEP_DURATION_MS - 1);
    expect(engine.checkIsBlocked({ x: 0, y: 0 })).toBe(true);

    engine.update(1);
    expect(engine.checkIsBlocked({ x: 0, y: 0 })).toBe(false);
  });

  test("a move while moving is ignored", () => {
    expect.hasAssertions();

    const engine = readEngine({
      characters: [{ id: FIRST_ID }],
      tiles: [
        [false, false, false],
        [false, false, false],
      ],
    });
    unwrap(engine.move(FIRST_ID, Direction.Right));

    engine.update(STEP_DURATION_MS / 2);
    unwrap(engine.move(FIRST_ID, Direction.Down));

    engine.update(STEP_DURATION_MS / 2);
    expect(engine.checkIsBlocked({ x: 1, y: 0 })).toBe(true);
    expect(engine.checkIsBlocked({ x: 0, y: 1 })).toBe(false);
  });

  test("a move into a blocked tile turns once and emits directionChanged once (#323, #319)", () => {
    expect.hasAssertions();

    const directionChanges: Direction[] = [];
    const engine = readEngine({ characters: [{ id: FIRST_ID }], tiles: [[false, true]] });
    engine.on("directionChanged", ({ direction }) => {
      directionChanges.push(direction);
    });

    unwrap(engine.move(FIRST_ID, Direction.Right));
    engine.update(STEP_DURATION_MS);
    unwrap(engine.move(FIRST_ID, Direction.Right));
    engine.update(STEP_DURATION_MS);

    expect(directionChanges).toStrictEqual([Direction.Right]);
  });

  test("a turn emits only on a change of facing", () => {
    expect.hasAssertions();

    const directionChanges: Direction[] = [];
    const engine = readEngine({ characters: [{ id: FIRST_ID }], tiles: [[false]] });
    engine.on("directionChanged", ({ direction }) => {
      directionChanges.push(direction);
    });

    unwrap(engine.turnTowards(FIRST_ID, Direction.Down));
    unwrap(engine.turnTowards(FIRST_ID, Direction.Right));
    unwrap(engine.turnTowards(FIRST_ID, Direction.Right));

    expect(directionChanges).toStrictEqual([Direction.Right]);
  });

  test("a move from a position listener starts on the next update (#528)", () => {
    expect.hasAssertions();

    let finishedCount = 0;
    const engine = readEngine({ characters: [{ id: FIRST_ID }], tiles: [[false, false, false]] });
    engine.on("positionChangeFinished", () => {
      finishedCount += 1;
      if (finishedCount === 1) unwrap(engine.move(FIRST_ID, Direction.Right));
    });
    unwrap(engine.move(FIRST_ID, Direction.Right));

    engine.update(STEP_DURATION_MS);
    expect(engine.checkIsBlocked({ x: 2, y: 0 })).toBe(false);

    engine.update(STEP_DURATION_MS);
    expect(engine.checkIsBlocked({ x: 2, y: 0 })).toBe(true);
    expect(finishedCount).toBe(2);
  });

  test("a diagonal move fails", () => {
    expect.hasAssertions();

    const engine = readEngine({
      characters: [{ id: FIRST_ID }],
      tiles: [
        [false, false],
        [false, false],
      ],
    });

    const error = readError(engine.move(FIRST_ID, Direction.DownRight));

    expect(error).toStrictEqual({ id: FIRST_ID, kind: GridEngineErrorKind.DiagonalMove });
  });

  test("a listener stays subscribed until it unsubscribes (#293)", () => {
    expect.hasAssertions();

    const directionChanges: Direction[] = [];
    const engine = readEngine({ characters: [{ id: FIRST_ID }], tiles: [[false]] });
    const unsubscribe = engine.on("directionChanged", ({ direction }) => {
      directionChanges.push(direction);
    });

    unwrap(engine.turnTowards(FIRST_ID, Direction.Right));
    unwrap(engine.turnTowards(FIRST_ID, Direction.Down));
    unsubscribe();
    unwrap(engine.turnTowards(FIRST_ID, Direction.Right));

    expect(directionChanges).toStrictEqual([Direction.Right, Direction.Down]);
  });

  test("movementStopped names the tile the character stopped on (#159)", () => {
    expect.hasAssertions();

    const stoppedAt: Position[] = [];
    const engine = readEngine({ characters: [{ id: FIRST_ID }], tiles: [[false, false, false]] });
    engine.on("movementStopped", ({ position }) => {
      stoppedAt.push(position);
    });
    unwrap(engine.move(FIRST_ID, Direction.Right));

    engine.update(STEP_DURATION_MS);

    expect(stoppedAt).toStrictEqual([{ x: 1, y: 0 }]);
  });

  test("a teleport releases the tile a moving character left (#551)", () => {
    expect.hasAssertions();

    const engine = readEngine({ characters: [{ id: FIRST_ID }], tiles: [[false, false, false]] });
    unwrap(engine.move(FIRST_ID, Direction.Right));
    engine.update(STEP_DURATION_MS / 2);

    unwrap(engine.setPosition(FIRST_ID, { x: 2, y: 0 }));

    expect(engine.checkIsBlocked({ x: 0, y: 0 })).toBe(false);
    expect(engine.checkIsBlocked({ x: 1, y: 0 })).toBe(false);
    expect(engine.checkIsBlocked({ x: 2, y: 0 })).toBe(true);
  });

  test("setPosition for an unknown character returns an error (#136)", () => {
    expect.hasAssertions();

    const engine = readEngine({ characters: [{ id: FIRST_ID }], tiles: [[false]] });

    const error = readError(engine.setPosition(SECOND_ID, { x: 0, y: 0 }));

    expect(error).toStrictEqual({ id: SECOND_ID, kind: GridEngineErrorKind.UnknownCharacter });
  });

  test("a new engine has no character of the previous one (#14, #287)", () => {
    expect.hasAssertions();

    const previousEngine = readEngine({ characters: [{ id: FIRST_ID }], tiles: [[false]] });
    const engine = readEngine({ tiles: [[false]] });

    expect(previousEngine.checkHasCharacter(FIRST_ID)).toBe(true);
    expect(engine.checkHasCharacter(FIRST_ID)).toBe(false);
  });

  test("a grid whose rows differ in length, or that has no row, is an invalid grid", () => {
    expect.hasAssertions();

    expect(readError(createGridEngine({ tiles: [] }))).toStrictEqual({ kind: GridEngineErrorKind.InvalidGrid });
    expect(readError(createGridEngine({ tiles: [[false], [false, false]] }))).toStrictEqual({
      kind: GridEngineErrorKind.InvalidGrid,
    });
  });

  test("a speed that is not a positive number is an invalid speed", () => {
    expect.hasAssertions();

    expect(readError(createGridEngine({ characters: [{ id: FIRST_ID, speed: 0 }], tiles: [[false]] }))).toStrictEqual({
      id: FIRST_ID,
      kind: GridEngineErrorKind.InvalidSpeed,
    });
    expect(readError(createGridEngine({ characters: [{ id: FIRST_ID, speed: -1 }], tiles: [[false]] }))).toStrictEqual({
      id: FIRST_ID,
      kind: GridEngineErrorKind.InvalidSpeed,
    });
  });

  test("a start or a teleport off the grid is refused as outside the grid", () => {
    expect.hasAssertions();

    expect(
      readError(createGridEngine({ characters: [{ id: FIRST_ID, startPosition: { x: 1, y: 0 } }], tiles: [[false]] })),
    ).toStrictEqual({ id: FIRST_ID, kind: GridEngineErrorKind.OutsideGrid, position: { x: 1, y: 0 } });

    const engine = readEngine({ characters: [{ id: FIRST_ID }], tiles: [[false]] });
    expect(readError(engine.setPosition(FIRST_ID, { x: 0, y: 1 }))).toStrictEqual({
      id: FIRST_ID,
      kind: GridEngineErrorKind.OutsideGrid,
      position: { x: 0, y: 1 },
    });
  });

  test("a start or a teleport off a whole tile is refused as outside the grid", () => {
    expect.hasAssertions();

    expect(
      readError(
        createGridEngine({ characters: [{ id: FIRST_ID, startPosition: { x: Number.NaN, y: 0 } }], tiles: [[false]] }),
      ),
    ).toStrictEqual({ id: FIRST_ID, kind: GridEngineErrorKind.OutsideGrid, position: { x: Number.NaN, y: 0 } });

    const engine = readEngine({ characters: [{ id: FIRST_ID }], tiles: [[false, false]] });
    expect(readError(engine.setPosition(FIRST_ID, { x: 0.5, y: 0 }))).toStrictEqual({
      id: FIRST_ID,
      kind: GridEngineErrorKind.OutsideGrid,
      position: { x: 0.5, y: 0 },
    });
  });
});

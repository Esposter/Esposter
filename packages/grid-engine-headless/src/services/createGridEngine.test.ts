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

// The tiles an engine's steps commit to, in the order they commit
const recordFinishedTiles = (engine: GridEngine): Position[] => {
  const finishedTiles: Position[] = [];
  engine.on("positionChangeFinished", ({ enterTile }) => {
    finishedTiles.push(enterTile);
  });
  return finishedTiles;
};

describe(createGridEngine, () => {
  const FIRST_ID = "0";
  const SECOND_ID = "1";
  const STEP_DURATION_MS = 1000 / 4;
  const ONE_SECOND_MS = 1000;
  const CORRIDOR_TILES = [[false, false, false, false, false, false]];
  const FOUR_TILES: Position[] = [
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
    { x: 4, y: 0 },
  ];

  // The world's walk: the move is asked again before each update, as its input asks it while a key is held
  const walkAskingEachUpdate = (engine: GridEngine, splitMs: number, updateCount: number): void => {
    for (let index = 0; index < updateCount; index += 1) {
      unwrap(engine.move(FIRST_ID, Direction.Right));
      engine.update(splitMs);
    }
  };

  // A run a listener keeps going: each commit asks for the next move, so one update can run on across the steps it ends
  const walkFromListener = (engine: GridEngine, splitMs: number, updateCount: number): void => {
    engine.on("positionChangeFinished", () => {
      unwrap(engine.move(FIRST_ID, Direction.Right));
    });
    unwrap(engine.move(FIRST_ID, Direction.Right));
    for (let index = 0; index < updateCount; index += 1) engine.update(splitMs);
  };

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

  test("a run covers the same tiles in one second at any split of updates, dividing a step or not (#419)", () => {
    expect.hasAssertions();

    for (const splitMs of [1, 5, 10, 20, 25, 50, 125, STEP_DURATION_MS, ONE_SECOND_MS]) {
      const engine = readEngine({ characters: [{ id: FIRST_ID }], tiles: CORRIDOR_TILES });
      const finishedTiles = recordFinishedTiles(engine);
      walkFromListener(engine, splitMs, ONE_SECOND_MS / splitMs);

      expect(finishedTiles).toStrictEqual(FOUR_TILES);
    }
  });

  test("a run asked before each update covers the same tiles at 20 ms updates as at 4 ms updates (#419)", () => {
    expect.hasAssertions();

    const coarseEngine = readEngine({ characters: [{ id: FIRST_ID }], tiles: CORRIDOR_TILES });
    const coarseTiles = recordFinishedTiles(coarseEngine);
    walkAskingEachUpdate(coarseEngine, 20, 50);

    const fineEngine = readEngine({ characters: [{ id: FIRST_ID }], tiles: CORRIDOR_TILES });
    const fineTiles = recordFinishedTiles(fineEngine);
    walkAskingEachUpdate(fineEngine, 4, 250);

    expect(coarseTiles).toStrictEqual(FOUR_TILES);
    expect(fineTiles).toStrictEqual(FOUR_TILES);
  });

  test("a stop at a tile with a large delta lands exactly on it, and the next move starts from there", () => {
    expect.hasAssertions();

    const engine = readEngine({ characters: [{ id: FIRST_ID }], tiles: CORRIDOR_TILES });
    const finishedTiles = recordFinishedTiles(engine);
    unwrap(engine.move(FIRST_ID, Direction.Right));

    engine.update(ONE_SECOND_MS);

    expect(finishedTiles).toStrictEqual([{ x: 1, y: 0 }]);
    expect(engine.checkIsBlocked({ x: 2, y: 0 })).toBe(false);

    // No move waits through this update, so the distance the last one passed its tile is dropped
    engine.update(ONE_SECOND_MS);
    // The listener asks for a Right move at each commit, so a leftover that reached the next run would run on
    engine.on("positionChangeFinished", () => {
      unwrap(engine.move(FIRST_ID, Direction.Right));
    });
    unwrap(engine.move(FIRST_ID, Direction.Right));
    engine.update(STEP_DURATION_MS);

    expect(finishedTiles).toStrictEqual([
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]);
  });

  test("a stop from a position listener at a tile with a large delta lands on that tile (#528)", () => {
    expect.hasAssertions();

    const stoppedAt: Position[] = [];
    const engine = readEngine({ characters: [{ id: FIRST_ID }], tiles: CORRIDOR_TILES });
    const finishedTiles = recordFinishedTiles(engine);
    engine.on("positionChangeFinished", ({ enterTile }) => {
      if (enterTile.x < 2) unwrap(engine.move(FIRST_ID, Direction.Right));
    });
    engine.on("movementStopped", ({ position }) => {
      stoppedAt.push(position);
    });
    unwrap(engine.move(FIRST_ID, Direction.Right));

    engine.update(ONE_SECOND_MS);

    expect(finishedTiles).toStrictEqual([
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]);
    expect(stoppedAt).toStrictEqual([{ x: 2, y: 0 }]);
    expect(engine.checkIsBlocked({ x: 3, y: 0 })).toBe(false);
  });

  test("a move in another direction does not take the distance a step past its end left", () => {
    expect.hasAssertions();

    const engine = readEngine({
      characters: [{ id: FIRST_ID }],
      tiles: [
        [false, false],
        [false, false],
        [false, false],
      ],
    });
    const finishedTiles = recordFinishedTiles(engine);
    unwrap(engine.move(FIRST_ID, Direction.Right));
    engine.update(ONE_SECOND_MS);

    // The listener asks for another Down move, so a leftover that reached the Down step would run on past its tile
    engine.on("positionChangeFinished", () => {
      unwrap(engine.move(FIRST_ID, Direction.Down));
    });
    unwrap(engine.move(FIRST_ID, Direction.Down));
    engine.update(STEP_DURATION_MS);

    expect(finishedTiles).toStrictEqual([
      { x: 1, y: 0 },
      { x: 1, y: 1 },
    ]);
  });

  test("a teleport drops the distance an update left past a step", () => {
    expect.hasAssertions();

    const engine = readEngine({ characters: [{ id: FIRST_ID }], tiles: CORRIDOR_TILES });
    unwrap(engine.move(FIRST_ID, Direction.Right));
    engine.update(ONE_SECOND_MS);

    // The listener asks for a Right move at each commit, so a leftover that reached the teleported run would run on
    engine.on("positionChangeFinished", () => {
      unwrap(engine.move(FIRST_ID, Direction.Right));
    });
    unwrap(engine.setPosition(FIRST_ID, { x: 0, y: 0 }));
    engine.update(STEP_DURATION_MS);

    expect(unwrap(engine.readCharacter(FIRST_ID)).position).toStrictEqual({ x: 1, y: 0 });
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

  test("readCharacter reports the tile a step left, its facing and its progress until the step is committed", () => {
    expect.hasAssertions();

    const engine = readEngine({ characters: [{ id: FIRST_ID }], tiles: [[false, false]] });
    unwrap(engine.move(FIRST_ID, Direction.Right));
    engine.update(STEP_DURATION_MS / 2);

    expect(unwrap(engine.readCharacter(FIRST_ID))).toStrictEqual({
      facingDirection: Direction.Right,
      position: { x: 0, y: 0 },
      progress: 500,
    });

    engine.update(STEP_DURATION_MS / 2);

    expect(unwrap(engine.readCharacter(FIRST_ID))).toStrictEqual({
      facingDirection: Direction.Right,
      position: { x: 1, y: 0 },
      progress: 0,
    });
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

  test("a stop from a position listener stops on that tile (#528)", () => {
    expect.hasAssertions();

    const finishedTiles: Position[] = [];
    const engine = readEngine({ characters: [{ id: FIRST_ID }], tiles: [[false, false, false, false]] });
    engine.on("positionChangeFinished", ({ enterTile }) => {
      finishedTiles.push(enterTile);
      if (enterTile.x === 1) unwrap(engine.move(FIRST_ID, Direction.Right));
    });
    unwrap(engine.move(FIRST_ID, Direction.Right));

    engine.update(STEP_DURATION_MS);
    engine.update(STEP_DURATION_MS);
    engine.update(STEP_DURATION_MS);

    expect(finishedTiles).toStrictEqual([
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]);
    expect(engine.checkIsBlocked({ x: 3, y: 0 })).toBe(false);
  });

  test("movementStarted brackets a run of steps, not each tile (#97, #121)", () => {
    expect.hasAssertions();

    const started: Direction[] = [];
    const stoppedAt: Position[] = [];
    const engine = readEngine({ characters: [{ id: FIRST_ID }], tiles: [[false, false, false, false]] });
    engine.on("movementStarted", ({ direction }) => {
      started.push(direction);
    });
    engine.on("movementStopped", ({ position }) => {
      stoppedAt.push(position);
    });
    engine.on("positionChangeFinished", ({ enterTile }) => {
      if (enterTile.x < 3) unwrap(engine.move(FIRST_ID, Direction.Right));
    });
    unwrap(engine.move(FIRST_ID, Direction.Right));

    for (let index = 0; index < 4; index += 1) engine.update(STEP_DURATION_MS);

    expect(started).toStrictEqual([Direction.Right]);
    expect(stoppedAt).toStrictEqual([{ x: 3, y: 0 }]);
  });

  test("a turn during a step is ignored and the facing stays the step's direction", () => {
    expect.hasAssertions();

    const directionChanges: Direction[] = [];
    const engine = readEngine({ characters: [{ id: FIRST_ID }], tiles: [[false, false]] });
    engine.on("directionChanged", ({ direction }) => {
      directionChanges.push(direction);
    });
    unwrap(engine.move(FIRST_ID, Direction.Right));
    engine.update(STEP_DURATION_MS / 2);

    unwrap(engine.turnTowards(FIRST_ID, Direction.Down));
    engine.update(STEP_DURATION_MS / 2);
    unwrap(engine.turnTowards(FIRST_ID, Direction.Right));

    expect(directionChanges).toStrictEqual([]);
  });

  test("a teleport mid-step places the character at once and stops its step (#109, #111)", () => {
    expect.hasAssertions();

    const finishedTiles: Position[] = [];
    const engine = readEngine({ characters: [{ id: FIRST_ID }], tiles: [[false, false, false, false]] });
    engine.on("positionChangeFinished", ({ enterTile }) => {
      finishedTiles.push(enterTile);
    });
    unwrap(engine.move(FIRST_ID, Direction.Right));
    engine.update(STEP_DURATION_MS / 2);

    unwrap(engine.setPosition(FIRST_ID, { x: 3, y: 0 }));

    expect(finishedTiles).toStrictEqual([{ x: 3, y: 0 }]);

    engine.update(STEP_DURATION_MS * 2);

    expect(finishedTiles).toStrictEqual([{ x: 3, y: 0 }]);
    expect(engine.checkIsBlocked({ x: 2, y: 0 })).toBe(false);
    expect(engine.checkIsBlocked({ x: 3, y: 0 })).toBe(true);
  });

  test("a character added without a sprite is placed and blocks (#107)", () => {
    expect.hasAssertions();

    const exitTiles: Position[] = [];
    const engine = readEngine({ tiles: [[false, false]] });
    engine.on("positionChangeStarted", ({ exitTile }) => {
      exitTiles.push(exitTile);
    });
    unwrap(engine.addCharacter({ id: FIRST_ID, startPosition: { x: 1, y: 0 } }));

    expect(engine.checkHasCharacter(FIRST_ID)).toBe(true);
    expect(engine.checkIsBlocked({ x: 1, y: 0 })).toBe(true);

    unwrap(engine.move(FIRST_ID, Direction.Left));
    engine.update(STEP_DURATION_MS);

    expect(exitTiles).toStrictEqual([{ x: 1, y: 0 }]);
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

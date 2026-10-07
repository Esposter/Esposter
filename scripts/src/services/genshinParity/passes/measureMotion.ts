import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { readLoginDoorPieces } from "#src/services/genshinAssets/fit/readLoginDoorPieces";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readComponentClips } from "#src/services/genshinAssets/shared/readComponentClips";
import { readComponentPlacements } from "#src/services/genshinAssets/shared/readComponentPlacements";
import {
  MOTION_HEIGHT,
  MOTION_PACE_GATE,
  MOTION_STEP_MS,
  MOTION_WIDTH,
  PART_GATE_METRES,
} from "#src/services/genshinParity/passes/constants";
import { PARITY_FRAME_MS } from "#src/services/genshinParity/shared/constants";
import { openParityPage } from "#src/services/genshinParity/shared/openParityPage";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
import { join } from "node:path";
import { Box3, Matrix4, Quaternion, Vector3 } from "three";

// The family whose pieces a clip moves, and the stages the scene stands still in and plays it at
const DOOR_FAMILY = "Door";
const STILL_STAGE = "Title";
const DOOR_STAGE = "Door";
// A pose between two of a clip's samples, its place along the line between theirs and its turn along the arc
const interpolatePose = (poses: readonly Matrix4[], sample: number): Matrix4 => {
  const last = poses.length - 1;
  const clamped = Math.min(Math.max(sample, 0), last);
  const index = Math.floor(clamped);
  const [startPosition, endPosition] = [new Vector3(), new Vector3()];
  const [startTurn, endTurn] = [new Quaternion(), new Quaternion()];
  const scale = new Vector3();
  poses[index]?.decompose(startPosition, startTurn, scale);
  poses[Math.min(index + 1, last)]?.decompose(endPosition, endTurn, scale);
  const share = clamped - index;
  return new Matrix4().compose(
    startPosition.lerp(endPosition, share),
    startTurn.slerp(endTurn, share),
    new Vector3(1, 1, 1),
  );
};
// The motion pass: the door's pieces as the scene plays their lift, read frame by frame on a faked clock from the
// Frame its stage turns to the door's, held against where the game's own lift clip carries each piece: its path, the
// Furthest any vertex of a piece stands from the clip's place at the frame's moment in metres, through the lift and at
// Rest, and its pace, how fast those moments pass against the clock. The login's door is the one part a clip moves so
// Far, so a component's motion pass reads it until another's parts move by their clips
export const measureMotion = async (component: DerivedAssetComponent): Promise<ParityPassMeasure> => {
  const meshDirectory = join(getComponentDirectory(component).assets, AssetType.Mesh);
  const { duration, foot, piecePoses, scaled, vertexPieces } = await readLoginDoorPieces(
    await readComponentPlacements(component),
    await readComponentClips(component),
    meshDirectory,
  );
  const pieceVertices = piecePoses.map((_poses, piece) =>
    scaled.flatMap(([x, y, z], vertex) => (vertexPieces[vertex] === piece ? [new Vector3(x, y - foot, z)] : [])),
  );
  const { browser, page } = await openParityPage({
    height: MOTION_HEIGHT,
    isClockFaked: true,
    props: { heldScrolled: 0, isInterfaceHidden: true, stage: STILL_STAGE },
    screen: DerivedAssetComponentMap[component].screen,
    width: MOTION_WIDTH,
  });
  const frames = await withFinalizerAsync(
    async () => {
      // Every frame's time as the page draws it, which the scene's clock moves by, its callback held on the window since
      // A function named in the page's code would be wrapped in a helper the page lacks
      await page.evaluate(() => {
        const frameTimes: number[] = [];
        Reflect.set(window, "frameTimes", frameTimes);
        Reflect.set(window, "recordFrame", (time: number) => {
          frameTimes.push(time);
          requestAnimationFrame(Reflect.get(window, "recordFrame") as FrameRequestCallback);
        });
        requestAnimationFrame(Reflect.get(window, "recordFrame") as FrameRequestCallback);
      });
      const readFrameTimes = (): Promise<number[]> =>
        page.evaluate(() => [...(Reflect.get(window, "frameTimes") as number[])]);
      // The clock moved a millisecond at a time until the page draws one more frame, so no frame passes unread, and the
      // Pieces as that frame left them with its time
      const drawFrame = async (): Promise<{ pieces: number[][]; time: number }> => {
        const { length } = await readFrameTimes();
        let frameTimes: number[] = [];
        while (frameTimes.length <= length) {
          // oxlint-disable-next-line no-await-in-loop -- the clock moves until the frame is drawn
          await page.clock.runFor(1);
          // oxlint-disable-next-line no-await-in-loop -- read after the clock moved
          frameTimes = await readFrameTimes();
        }
        const pieces = await page.evaluate(
          (family) => (Reflect.get(window, "getScenePieces") as (family: string) => number[][])(family),
          DOOR_FAMILY,
        );
        return { pieces, time: frameTimes.at(-1) ?? 0 };
      };
      // Until the lift begins every piece stands where its first sample has it, frame after frame, so the lift's moment
      // Is read off the pieces themselves: from the last frame they stood there, whenever the stage reached the scene
      const { pieces: startPieces, time: startTime } = await drawFrame();
      const startElements = JSON.stringify(startPieces);
      await page.evaluate((stage) => {
        (Reflect.get(window, "setScreenProps") as (props: Record<string, unknown>) => void)({ stage });
      }, DOOR_STAGE);
      const liftFrameCount = Math.ceil((duration * 1000) / PARITY_FRAME_MS);
      const read: { pieces: number[][]; riseMs: number }[] = [];
      let originTime = startTime;
      // Through the lift and a frame at rest past it, the lift due within as many frames as it lasts
      for (let frame = 0; (read.at(-1)?.riseMs ?? 0) <= duration * 1000 + PARITY_FRAME_MS; frame++) {
        if (read.length === 0 && frame > liftFrameCount)
          throw new InvalidOperationError(Operation.Read, DOOR_FAMILY, "never began its lift");
        // oxlint-disable-next-line no-await-in-loop -- the page draws one frame after another
        const { pieces, time } = await drawFrame();
        if (read.length === 0 && JSON.stringify(pieces) === startElements) originTime = time;
        else read.push({ pieces, riseMs: time - originTime });
      }
      return read;
    },
    () => browser.close(),
  );
  const sampleRate = ((piecePoses[0]?.length ?? 1) - 1) / duration;
  // Each piece's box, whose corners stand furthest from its place among its vertices
  const pieceCorners = pieceVertices.map((vertices) => {
    const box = new Box3().setFromPoints(vertices);
    if (box.isEmpty()) return [];
    return [0, 1, 2, 3, 4, 5, 6, 7].map(
      (corner) =>
        new Vector3(
          corner & 1 ? box.max.x : box.min.x,
          corner & 2 ? box.max.y : box.min.y,
          corner & 4 ? box.max.z : box.min.z,
        ),
    );
  });
  const point = new Vector3();
  const expectedPoint = new Vector3();
  // How far any of the given points of any piece stands from where the clip has it so many milliseconds in, and which
  const measurePose = (
    oursPoses: readonly Matrix4[],
    riseMs: number,
    piecePoints: readonly (readonly Vector3[])[],
  ): { distance: number; piece: number } => {
    let furthest = { distance: 0, piece: 0 };
    for (const [piece, ours] of oursPoses.entries()) {
      const expected = interpolatePose(piecePoses[piece] ?? [], (riseMs / 1000) * sampleRate);
      for (const vertex of piecePoints[piece] ?? []) {
        const distance = point
          .copy(vertex)
          .applyMatrix4(ours)
          .distanceTo(expectedPoint.copy(vertex).applyMatrix4(expected));
        if (distance > furthest.distance) furthest = { distance, piece };
      }
    }
    return furthest;
  };
  // A frame's moment along the clip, refined from its clock's within a frame either side: the page's frames and the
  // Scene's own clock read the time a millisecond or two apart, and a piece rising at metres a second moves centimetres
  // In that, so its path is held at the moment its pose stands at, and the pace those moments keep against the clock
  const fitted = frames.map(({ pieces, riseMs }) => {
    const oursPoses = pieces.map((elements) => new Matrix4().fromArray(elements));
    let best = { distance: Infinity, riseMs };
    for (let candidate = riseMs - PARITY_FRAME_MS; candidate <= riseMs + PARITY_FRAME_MS; candidate += MOTION_STEP_MS) {
      const { distance } = measurePose(oursPoses, candidate, pieceCorners);
      if (distance < best.distance) best = { distance, riseMs: candidate };
    }
    return { clockMs: riseMs, ...measurePose(oursPoses, best.riseMs, pieceVertices), riseMs: best.riseMs };
  });
  const furthest = fitted.reduce((largest, frame) => (frame.distance > largest.distance ? frame : largest));
  // The pace: the moments' slope against the clock over the lift, by least squares, at rest past it read as a moment
  const lifting = fitted.filter(({ clockMs }) => clockMs < duration * 1000);
  const meanClock = lifting.reduce((sum, { clockMs }) => sum + clockMs, 0) / lifting.length;
  const meanRise = lifting.reduce((sum, { riseMs }) => sum + riseMs, 0) / lifting.length;
  const pace =
    lifting.reduce((sum, { clockMs, riseMs }) => sum + (clockMs - meanClock) * (riseMs - meanRise), 0) /
    lifting.reduce((sum, { clockMs }) => sum + (clockMs - meanClock) ** 2, 0);
  return {
    notes: [
      `${frames.length} frames over the door's ${duration.toFixed(2)} s lift: furthest piece ${furthest.piece}, ${Math.round(furthest.riseMs)} ms in, played at ${pace.toFixed(4)} of the clip's pace`,
    ],
    readings: [
      { gate: PART_GATE_METRES, name: "door lift path", unit: "m", value: furthest.distance },
      { gate: MOTION_PACE_GATE, name: "door lift pace", unit: "share", value: Math.abs(pace - 1) },
    ],
  };
};

/* oxlint-disable no-await-in-loop -- Each step reads the last: the clock moves one frame, and the frame is read
   after it moved; Order is the contract: the page draws one frame after another, and the lift is timed from the last
   rest frame before it */
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { LiftFrame } from "#src/models/genshinParity/passes/LiftFrame";
import type { ParityPassMeasure } from "#src/models/genshinParity/shared/ParityPassMeasure";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { readLoginDoorPieces } from "#src/services/genshinAssets/fit/readLoginDoorPieces";
import { LOGIN_DOOR_MESH } from "#src/services/genshinAssets/shared/constants";
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
import { createLiftFrameSampler } from "#src/services/genshinParity/passes/createLiftFrameSampler";
import { interpolatePose } from "#src/services/genshinParity/passes/interpolatePose";
import { PARITY_FRAME_MS } from "#src/services/genshinParity/shared/constants";
import { openParityPage } from "#src/services/genshinParity/shared/openParityPage";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
import { LoginStage } from "genshin-world";
import { join } from "node:path";
import { Box3, Matrix4, Vector3 } from "three";

declare global {
  interface Window {
    frameTimes: number[];
    getScenePieces: (family: string) => number[][];
    recordFrame: FrameRequestCallback;
  }
}

// The family whose pieces a clip moves, and the stages the scene stands still in and plays it at
const DOOR_FAMILY = "Door";
// The page's frames as its faked clock fires them, every 16 milliseconds
const PAGE_FRAME_MS = 16;

// The motion pass: the door's pieces as the scene plays their lift, read frame by frame on a faked clock from the
// Frame its stage turns to the door's, held against where the game's own lift clip carries each piece: its path, the
// Furthest any vertex of a piece stands from the clip's place at the frame's moment in metres, through the lift and at
// Rest, and its pace, how fast those moments pass against the clock. The login's door is the one part a clip moves so
// Far, so a component's motion pass reads it, and a component placing no such door is not owed the pass until another's
// Parts move by their clips
export const measureMotion = async (
  component: DerivedAssetComponent,
  pageRoot?: string,
): Promise<ParityPassMeasure> => {
  const placements = await readComponentPlacements(component);
  if (!placements.some(({ name }) => name === LOGIN_DOOR_MESH))
    return { isNotOwed: true, notes: [`${component} places no door a clip moves`], readings: [] };
  const meshDirectory = join(getComponentDirectory(component).assets, AssetType.Mesh);
  const { duration, foot, piecePoses, scaled, vertexPieces } = await readLoginDoorPieces(
    placements,
    await readComponentClips(component),
    meshDirectory,
  );
  const pieceVertices = piecePoses.map((_poses, piece) =>
    scaled.flatMap(([x, y, z], vertex) => (vertexPieces[vertex] === piece ? [new Vector3(x, y - foot, z)] : [])),
  );
  const { close, page } = await openParityPage({
    height: MOTION_HEIGHT,
    isClockFaked: true,
    pageRoot,
    props: { heldScrolled: 0, isInterfaceHidden: true, stage: LoginStage.Title },
    screen: DerivedAssetComponentMap[component].screen,
    width: MOTION_WIDTH,
  });
  const frames = await withFinalizerAsync(
    async () => {
      // Every frame's time as the page draws it, which the scene's clock moves by, its callback held on the window
      // Since A function named in the page's code would be wrapped in a helper the page lacks
      await page.evaluate(() => {
        const frameTimes: number[] = [];
        window.frameTimes = frameTimes;
        window.recordFrame = (time: number) => {
          frameTimes.push(time);
          requestAnimationFrame(window.recordFrame);
        };
        requestAnimationFrame(window.recordFrame);
      });
      // The clock moves a fixed step each sample, and the frame read is the one the page drew by then with its pieces,
      // So the frames sampled are the clock's, whatever the page's speed (`createLiftFrameSampler`)
      const sampleFrame = createLiftFrameSampler(
        {
          advance: (ms) => page.clock.runFor(ms),
          // The page draws its frames on its own schedule, so a read waits until the frame at the clock's tick is
          // Drawn: the last one the faked clock has passed, a multiple of the page's frame. Read as it stood, a sample
          // Could take the frame a tick earlier, and the moments the pace is fitted over moved by a tick between runs
          readFrame: async (): Promise<LiftFrame> => {
            await page.waitForFunction(
              (frameMs) => (window.frameTimes.at(-1) ?? -1) >= Math.floor(performance.now() / frameMs) * frameMs,
              PAGE_FRAME_MS,
            );
            return page.evaluate(
              (family) => ({ pieces: window.getScenePieces(family), time: window.frameTimes.at(-1) ?? 0 }),
              DOOR_FAMILY,
            );
          },
        },
        PARITY_FRAME_MS,
      );
      // The page's loading steps the clock a frame at a time, a count that varies with the machine's speed, so the
      // Clock would stand at a different phase of the page's 16 ms frames each run and every sample would read a frame
      // A tick off. It is moved to the next frame boundary first, so the moments the samples read are the same whatever
      // The loading took
      const elapsedMs = await page.evaluate(() => performance.now());
      const toBoundaryMs = (PAGE_FRAME_MS - (elapsedMs % PAGE_FRAME_MS)) % PAGE_FRAME_MS;
      if (toBoundaryMs > 0) await page.clock.runFor(toBoundaryMs);
      // Until the lift begins every piece stands where its first sample has it, frame after frame, so the lift's moment
      // Is read off the pieces themselves: from the last frame they stood there, whenever the stage reached the scene
      const { pieces: startPieces, time: startTime } = await sampleFrame();
      const startElements = JSON.stringify(startPieces);
      await page.evaluate((stage) => {
        window.setScreenProps({ stage });
      }, LoginStage.Door);
      const liftFrameCount = Math.ceil((duration * 1000) / PARITY_FRAME_MS);
      const read: { pieces: number[][]; riseMs: number }[] = [];
      let originTime = startTime;
      // Through the lift and a frame at rest past it, the lift due within as many frames as it lasts
      for (let frame = 0; (read.at(-1)?.riseMs ?? 0) <= duration * 1000 + PARITY_FRAME_MS; frame++) {
        if (read.length === 0 && frame > liftFrameCount)
          throw new InvalidOperationError(Operation.Read, DOOR_FAMILY, "never began its lift");
        const { pieces, time } = await sampleFrame();
        if (read.length === 0 && JSON.stringify(pieces) === startElements) originTime = time;
        else read.push({ pieces, riseMs: time - originTime });
      }
      return read;
    },
    () => close(),
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
    if (pieces.length !== piecePoses.length)
      throw new InvalidOperationError(
        Operation.Read,
        DOOR_FAMILY,
        "drew a different number of pieces than its clip moves",
      );
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

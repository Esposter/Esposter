import type { SceneContext } from "#src/models/scene/SceneContext";

import { InvalidOperationError, Operation } from "@esposter/shared";

// A scene's cost over the frames it draws: the time between each frame and the last, and from its renderer's own count
// Of the frame, the passes it renders, their draw calls and triangles, and what it keeps on the device, its pipelines,
// Geometries and textures, which grow from one bench to the next when a scene leaks them; and the objects it draws by
// Kind, each a draw call of its own in every pass it is drawn in
export const benchScene = async (
  context: SceneContext | undefined,
  frameCount: number,
): Promise<{
  drawCalls: number;
  frameCalls: number;
  geometries: number;
  intervals: number[];
  kindCounts: Record<string, number>;
  programs: number;
  textures: number;
  triangles: number;
}> => {
  if (!context) throw new InvalidOperationError(Operation.Read, "scene", "the scene has not rendered yet");
  const { info } = context.renderer;
  const intervals: number[] = [];
  let lastTime = await new Promise<number>((resolve) => {
    window.requestAnimationFrame((time) => {
      resolve(time);
    });
  });
  // The renderer resets its counts each frame from a loop of its own, which runs in no set order with TresJS's that
  // Draws, so they are left to run on over every frame and shared out among them
  info.autoReset = false;
  info.reset();
  for (let frame = 0; frame < frameCount; frame++) {
    // oxlint-disable-next-line no-await-in-loop -- one frame is timed after another
    const time = await new Promise<number>((resolve) => {
      window.requestAnimationFrame((time) => {
        resolve(time);
      });
    });
    intervals.push(time - lastTime);
    lastTime = time;
  }
  info.autoReset = true;
  const kindCounts: Record<string, number> = {};
  context.scene.traverseVisible(({ type }) => {
    kindCounts[type] = (kindCounts[type] ?? 0) + 1;
  });
  const {
    memory: { geometries, programs, textures },
    render: { drawCalls, frameCalls, triangles },
  } = info;
  return {
    drawCalls: drawCalls / frameCount,
    frameCalls: frameCalls / frameCount,
    geometries,
    intervals,
    kindCounts,
    programs,
    textures,
    triangles: triangles / frameCount,
  };
};

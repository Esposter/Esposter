import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";

import { SHOTS_DIRECTORY } from "#src/services/genshinParity/constants";
import { openParityPage } from "#src/services/genshinParity/openParityPage";
import { setPageWitnessView } from "#src/services/genshinParity/setPageWitnessView";
import { withFinalizerAsync } from "@esposter/shared";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// A scene seen from any camera, ours beside the exports it stands for: its own parts on the left and the witness's in
// Their place on the right, under one camera, light and frame, so a stand-in is judged where no reference looks, such
// As a stretch the camera glides through. The camera's eye is in three's axes, its heading, pitch and vertical field of
// View in degrees. The props hand the scene the state it is viewed in: one whose rows stand at their own places (the
// Login at its door), since the witness lays them out unscrolled
export const viewScene = async ({
  camera: [x, y, z, yaw, pitch, fov],
  height,
  familyOffsets,
  familyScales,
  isAlone = false,
  props,
  screen,
  width,
  witness,
}: {
  camera: readonly [number, number, number, number, number, number];
  // How far each family stands off its laid-out place, in metres in three's axes, to try a row's phase
  familyOffsets?: Record<string, [number, number, number]>;
  // How many times each family's parts are drawn about their own places, to try a part's scale against a reference
  familyScales?: Record<string, number>;
  height: number;
  // Whether the scene draws without its fog, clouds and cloud sea, for a layout read from far off
  isAlone?: boolean;
  props: Record<string, unknown>;
  screen: string;
  width: number;
  witness: DerivedAssetComponent;
}): Promise<string> => {
  await mkdir(SHOTS_DIRECTORY, { recursive: true });
  const { browser, page } = await openParityPage({ height, props, screen, width, witness });
  const path = join(SHOTS_DIRECTORY, `${screen}.view@${[x, y, z, yaw, pitch, fov].join(",")}.png`);
  await withFinalizerAsync(
    async () => {
      const families = ((await page.evaluate(() => window.document.body.dataset.witnessFamilies)) ?? "")
        .split(",")
        .filter(Boolean);
      const pose = {
        fov,
        pitch: (pitch * Math.PI) / 180,
        position: [x, y, z] as [number, number, number],
        yaw: (yaw * Math.PI) / 180,
      };
      const shots: Buffer[] = [];
      for (const viewFamilies of [[], families]) {
        // oxlint-disable-next-line no-await-in-loop -- one view is drawn and shot before the next
        await setPageWitnessView(page, { camera: pose, families: viewFamilies, familyOffsets, familyScales, isAlone });
        // oxlint-disable-next-line no-await-in-loop -- the shot belongs to the view just set
        shots.push(await page.screenshot());
      }
      const [ours, exported] = shots;
      if (!ours || !exported) return;
      const { height: shotHeight, width: shotWidth } = await sharp(ours).metadata();
      await sharp({ create: { background: "#000", channels: 3, height: shotHeight, width: shotWidth * 2 } })
        .composite([
          { input: ours, left: 0, top: 0 },
          { input: exported, left: shotWidth, top: 0 },
        ])
        .png()
        .toFile(path);
    },
    () => browser.close(),
  );
  console.log(path);
  return path;
};

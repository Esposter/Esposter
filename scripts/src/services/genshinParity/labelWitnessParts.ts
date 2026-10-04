import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import type { PageWitnessView } from "#src/services/genshinParity/setPageWitnessView";

import { PARITY_DIRECTORY, REFERENCES_DIRECTORY } from "#src/services/genshinParity/constants";
import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/openWitnessPage";
import { setPageWitnessView } from "#src/services/genshinParity/setPageWitnessView";
import { withFinalizerAsync } from "@esposter/shared";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

interface WitnessPart {
  mesh: string;
  position: [number, number, number];
  screen: [number, number];
}
// Each part of a family the witness draws at a reference's view, numbered where the top of it lands, over the reference
// And over the witness's own render side by side, so a part is matched to what the reference shows by eye and named as
// A landmark by its mesh and where it stands. The list is printed with each part's pixel in the reference's own pixels
export const labelWitnessParts = async (
  referenceId: string,
  witness: DerivedAssetComponent,
  family: string,
  camera?: PageWitnessView["camera"],
): Promise<{ imagePath: string; parts: (WitnessPart & { pixel: [number, number] })[] }> => {
  await fetchReferences();
  const referencePath = join(REFERENCES_DIRECTORY, `${referenceId}.png`);
  const { height, width } = await sharp(referencePath).metadata();
  const { browser, page } = await openWitnessPage(referenceId, witness);
  return withFinalizerAsync(
    async () => {
      await setPageWitnessView(page, { camera });
      const parts = (
        await page.evaluate(
          (familyName) => (Reflect.get(window, "computeWitnessParts") as (family: string) => WitnessPart[])(familyName),
          family,
        )
      ).map((part) =>
        Object.assign(part, { pixel: [part.screen[0] * width, part.screen[1] * height] as [number, number] }),
      );
      const shot = await sharp(await page.screenshot())
        .resize(width, height)
        .png()
        .toBuffer();
      const labels = parts
        .map(
          ({ pixel: [x, y] }, index) =>
            `<circle cx="${x}" cy="${y}" r="6" fill="#f0f"/><text x="${x + 8}" y="${y - 8}" font-family="monospace" font-size="${Math.round(height / 40)}" fill="#f0f" stroke="#000" stroke-width="1">${index}</text>`,
        )
        .join("");
      const svg = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${labels}</svg>`,
      );
      const directory = join(PARITY_DIRECTORY, "parts");
      await mkdir(directory, { recursive: true });
      const imagePath = join(directory, `${referenceId}.${family}.png`);
      const [labelledReference, labelledShot] = await Promise.all(
        [await sharp(referencePath).png().toBuffer(), shot].map((input) =>
          sharp(input)
            .composite([{ input: svg }])
            .png()
            .toBuffer(),
        ),
      );
      await sharp({ create: { background: "#000", channels: 3, height, width: width * 2 } })
        .composite([
          { input: labelledReference, left: 0, top: 0 },
          { input: labelledShot, left: width, top: 0 },
        ])
        .png()
        .toFile(imagePath);
      return { imagePath, parts };
    },
    () => browser.close(),
  );
};

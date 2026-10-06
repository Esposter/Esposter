import { props } from "#src/components/World/Screen/Index.fixture";
import WorldScreen from "#src/components/World/Screen/Index.vue";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

// Each pixel's luminance in the screenshot, from nought to one
const readLuminances = async (): Promise<number[]> => {
  const screenshot = await page.screenshot({ save: false });
  const response = await fetch(`data:image/png;base64,${screenshot}`);
  const bitmap = await createImageBitmap(await response.blob());
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext("2d");
  if (!context) return [];
  context.drawImage(bitmap, 0, 0);
  const { data } = context.getImageData(0, 0, bitmap.width, bitmap.height);
  const luminances: number[] = [];
  for (let index = 0; index < data.length; index += 4)
    luminances.push(((data[index] ?? 0) + (data[index + 1] ?? 0) + (data[index + 2] ?? 0)) / 3 / 255);
  return luminances;
};

const waitForFrames = async (frameCount: number): Promise<void> => {
  for (let frame = 0; frame < frameCount; frame++)
    // oxlint-disable-next-line no-await-in-loop -- each frame is waited on after the one before it
    await new Promise((resolve) => {
      requestAnimationFrame(resolve);
    });
};

describe("worldScreen", () => {
  // The world draws its first view in a headless browser slower than on a screen
  const timeoutMs = 60_000;
  // A second of frames, past what the ground of one view takes to stream in
  const settleFrameCount = 60;

  test(
    "is ready once the ground of its first view has arrived, unveiled",
    async () => {
      expect.hasAssertions();

      const { promise: ready, resolve: resolveReady } = Promise.withResolvers<void>();
      await render(WorldScreen, { attrs: { onReady: resolveReady }, props });
      await ready;
      const readyLuminances = await readLuminances();
      await waitForFrames(settleFrameCount);
      const settledLuminances = await readLuminances();
      // The water under a ground still streaming in differs from the ground by far more than the clouds, the
      // Ripples and the grass move in a second
      const meanDifference =
        readyLuminances.reduce(
          (sum, luminance, index) => sum + Math.abs(luminance - (settledLuminances[index] ?? 0)),
          0,
        ) / readyLuminances.length;
      // A veil over the whole frame lifts its darkest tones, which the shade and the foliage hold well under half
      const darkestTwentieth = readyLuminances.toSorted(
        (firstLuminance, secondLuminance) => firstLuminance - secondLuminance,
      )[Math.floor(readyLuminances.length / 20)];

      expect(meanDifference).toBeLessThan(0.02);
      expect(darkestTwentieth).toBeLessThan(0.5);
    },
    timeoutMs,
  );
});

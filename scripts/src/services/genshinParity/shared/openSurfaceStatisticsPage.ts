import { PARITY_PAGE_ROOT } from "#src/services/genshinParity/shared/constants";
import { getResultAsync } from "@esposter/shared";
import { chromium } from "playwright";

export interface SurfaceStatisticsPage {
  close: () => Promise<void>;
  // A surface's statistics over the pixels its mask holds, reduced on the page's GPU, as `computeStructureError` reads them
  computeStatistics: (
    values: Float32Array,
    mask: Uint8Array,
    width: number,
    height: number,
    sigmas: readonly number[],
  ) => Promise<number[]>;
}

// The parity page's root, where the GPU reductions a surface's structure is scored by are served. The caller closes the
// Page with `close`, which closes the browser it launched
export const openSurfaceStatisticsPage = async (): Promise<SurfaceStatisticsPage> => {
  const browser = await chromium.launch({ channel: "msedge" });
  const close = async (): Promise<void> => {
    await browser.close();
  };
  return getResultAsync(async (): Promise<SurfaceStatisticsPage> => {
    const page = await browser.newPage();
    await page.goto(PARITY_PAGE_ROOT, { waitUntil: "load" });
    await page.waitForFunction(() => Reflect.has(window, "computeSurfaceStatistics"));
    return {
      close,
      computeStatistics: (values, mask, width, height, sigmas) =>
        page.evaluate(
          (input) => (Reflect.get(window, "computeSurfaceStatistics") as (input: unknown) => Promise<number[]>)(input),
          {
            height,
            mask: Buffer.from(mask.buffer, mask.byteOffset, mask.byteLength).toString("base64"),
            sigmas: [...sigmas],
            values: Buffer.from(values.buffer, values.byteOffset, values.byteLength).toString("base64"),
            width,
          },
        ),
    };
  }).match(
    (value) => value,
    async (error) => {
      await close();
      throw error;
    },
  );
};

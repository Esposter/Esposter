import type { WitnessGbuffer } from "#src/models/genshinParity/WitnessGbuffer";
import type { Page } from "playwright";

interface PageWitnessTargets {
  families: string[];
  height: number;
  parts: WitnessGbuffer["parts"];
  targets: Record<"albedo" | "depth" | "normal" | "part", string>;
  width: number;
}
const toFloats = (base64: string): Float32Array => {
  const bytes = Buffer.from(base64, "base64");
  return new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / Float32Array.BYTES_PER_ELEMENT);
};
// The witness page's G-buffer at the view last set, as the page's `renderWitnessTargets` reads it back from the
// Renderer, each target handed over as base64
export const readWitnessGbuffer = async (page: Page): Promise<WitnessGbuffer> => {
  const { families, height, parts, targets, width } = await page.evaluate(() =>
    (Reflect.get(window, "renderWitnessTargets") as () => Promise<PageWitnessTargets>)(),
  );
  return {
    albedo: toFloats(targets.albedo),
    depth: toFloats(targets.depth),
    families,
    height,
    normal: toFloats(targets.normal),
    part: toFloats(targets.part),
    parts,
    width,
  };
};

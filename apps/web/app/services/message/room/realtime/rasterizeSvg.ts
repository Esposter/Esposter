import { rasterizeSvg as rasterizeSvgBlob } from "#src/services/capture/rasterizeSvg";
import { FULL_HD_RESOLUTION } from "#src/services/message/room/call/constants";
import { getResultAsync } from "@esposter/shared";

const rasterizedSvgCache = new Map<string, Promise<string | undefined>>();

const rasterizeSvgFile = (svgUrl: string) =>
  getResultAsync(async () => {
    const svgResponse = await fetch(svgUrl);
    const svgBlob = await svgResponse.blob();
    const pngBlob = await rasterizeSvgBlob(svgBlob, FULL_HD_RESOLUTION.width, FULL_HD_RESOLUTION.height, 1);
    return URL.createObjectURL(pngBlob);
  })
    .orTee(console.error)
    .unwrapOr(undefined);

// The rasterization in flight is what is cached, so picks that overlap share one fetch and one canvas. A failure is
// Evicted, so the next pick reads the preset again rather than being handed the failure
export const rasterizeSvg = async (svgUrl: string) => {
  const cachedRasterization = rasterizedSvgCache.get(svgUrl);
  if (cachedRasterization) return cachedRasterization;

  const rasterization = rasterizeSvgFile(svgUrl);
  rasterizedSvgCache.set(svgUrl, rasterization);
  const rasterizedSvgBlobUrl = await rasterization;
  if (!rasterizedSvgBlobUrl) rasterizedSvgCache.delete(svgUrl);
  return rasterizedSvgBlobUrl;
};

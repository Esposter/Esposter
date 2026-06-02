import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";

const width = 1920;
const height = 1080;
const rasterizedSvgCache = new Map<string, string>();

export const rasterizeSvg = (svgUrl: string) =>
  getResultAsync(async () => {
    const cachedRasterizedSvgUrl = rasterizedSvgCache.get(svgUrl);
    if (cachedRasterizedSvgUrl) return cachedRasterizedSvgUrl;

    const svgResponse = await fetch(svgUrl);
    const svgBlob = await svgResponse.blob();
    const svgObjectUrl = URL.createObjectURL(svgBlob);
    const svgImage = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve(img);
      };
      img.onerror = reject;
      img.src = svgObjectUrl;
    });
    URL.revokeObjectURL(svgObjectUrl);
    const rasterizationCanvas = document.createElement("canvas");
    rasterizationCanvas.width = width;
    rasterizationCanvas.height = height;
    const rasterizationContext = rasterizationCanvas.getContext("2d");
    if (!rasterizationContext) throw new InvalidOperationError(Operation.Create, rasterizeSvg.name, svgUrl);
    rasterizationContext.drawImage(svgImage, 0, 0, width, height);

    const rasterizedSvgBlobUrl = await new Promise<string>((resolve, reject) => {
      rasterizationCanvas.toBlob((rasterizedSvgBlob) => {
        if (!rasterizedSvgBlob) {
          reject(new InvalidOperationError(Operation.Create, svgUrl, "Canvas toBlob returned null"));
          return;
        }
        resolve(URL.createObjectURL(rasterizedSvgBlob));
      }, "image/png");
    });

    rasterizedSvgCache.set(svgUrl, rasterizedSvgBlobUrl);
    return rasterizedSvgBlobUrl;
  }).match(
    (rasterizedSvgBlobUrl) => rasterizedSvgBlobUrl,
    (error) => {
      console.error(error);
      return null;
    },
  );

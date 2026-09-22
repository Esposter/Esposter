import { MimeType } from "#shared/models/file/MimeType";
import { FULL_HD_RESOLUTION } from "@/services/message/room/call/constants";
import { getResultAsync, InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";

const rasterizedSvgCache = new Map<string, string>();

export const rasterizeSvg = (svgUrl: string) =>
  getResultAsync(async () => {
    const cachedRasterizedSvgUrl = rasterizedSvgCache.get(svgUrl);
    if (cachedRasterizedSvgUrl) return cachedRasterizedSvgUrl;

    const svgResponse = await fetch(svgUrl);
    const svgBlob = await svgResponse.blob();
    const svgObjectUrl = URL.createObjectURL(svgBlob);
    const svgImage = await withFinalizerAsync(
      () =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => {
            resolve(image);
          };
          image.onerror = () => {
            reject(new InvalidOperationError(Operation.Read, rasterizeSvg.name, svgUrl));
          };
          image.src = svgObjectUrl;
        }),
      () => {
        URL.revokeObjectURL(svgObjectUrl);
      },
    );
    const rasterizationCanvas = window.document.createElement("canvas");
    rasterizationCanvas.width = FULL_HD_RESOLUTION.width;
    rasterizationCanvas.height = FULL_HD_RESOLUTION.height;
    const rasterizationContext = rasterizationCanvas.getContext("2d");
    if (!rasterizationContext) throw new InvalidOperationError(Operation.Create, rasterizeSvg.name, svgUrl);
    rasterizationContext.drawImage(svgImage, 0, 0, FULL_HD_RESOLUTION.width, FULL_HD_RESOLUTION.height);

    const rasterizedSvgBlobUrl = await new Promise<string>((resolve, reject) => {
      rasterizationCanvas.toBlob((rasterizedSvgBlob) => {
        if (!rasterizedSvgBlob) {
          reject(
            new InvalidOperationError(Operation.Create, rasterizeSvg.name, `Canvas toBlob returned null for ${svgUrl}`),
          );
          return;
        }
        resolve(URL.createObjectURL(rasterizedSvgBlob));
      }, MimeType.Png);
    });

    rasterizedSvgCache.set(svgUrl, rasterizedSvgBlobUrl);
    return rasterizedSvgBlobUrl;
  }).match(
    (rasterizedSvgBlobUrl) => rasterizedSvgBlobUrl,
    (error) => {
      console.error(error);
      return undefined;
    },
  );

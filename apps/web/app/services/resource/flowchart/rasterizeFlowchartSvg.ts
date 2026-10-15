import { MimeType } from "#shared/models/file/MimeType";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";

export const rasterizeFlowchartSvg = async (svg: Blob, width: number, height: number) => {
  const svgUrl = URL.createObjectURL(svg);
  const image = new Image();
  const loadedImage = await withFinalizerAsync(
    () =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        image.onload = () => resolve(image);
        image.onerror = () => {
          reject(new InvalidOperationError(Operation.Read, rasterizeFlowchartSvg.name, "Could not load exported SVG"));
        };
        image.src = svgUrl;
      }),
    () => URL.revokeObjectURL(svgUrl),
  );
  const scale = window.devicePixelRatio * 2;
  const canvas = window.document.createElement("canvas");
  canvas.width = Math.ceil(width * scale);
  canvas.height = Math.ceil(height * scale);
  const context = canvas.getContext("2d");
  if (!context)
    throw new InvalidOperationError(Operation.Create, rasterizeFlowchartSvg.name, "Could not create export canvas");
  context.drawImage(loadedImage, 0, 0, canvas.width, canvas.height);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new InvalidOperationError(Operation.Create, rasterizeFlowchartSvg.name, "PNG export returned empty"));
    }, MimeType.Png);
  });
};

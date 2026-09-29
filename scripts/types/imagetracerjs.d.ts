declare module "imagetracerjs" {
  interface TracerImageData {
    data: Uint8ClampedArray;
    height: number;
    width: number;
  }

  const ImageTracer: { imagedataToSVG: (imageData: TracerImageData, options?: Record<string, unknown>) => string };
  export default ImageTracer;
}

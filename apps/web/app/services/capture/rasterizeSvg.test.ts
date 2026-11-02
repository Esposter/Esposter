import type { Mock } from "vitest";

import { MimeType } from "#shared/models/file/MimeType";
import { rasterizeSvg } from "@/services/capture/rasterizeSvg";
import { noop } from "@esposter/shared";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";

describe(rasterizeSvg, () => {
  // The browser's canvas and image are missing from the node environment, so the test stands in for them: the image loads on the next tick,
  // And the canvas records the size it is drawn at. The export draws at the device pixel ratio times two, and the ratio is stood in as one
  const DEVICE_PIXEL_RATIO = 1;
  const EXPORT_SCALE = DEVICE_PIXEL_RATIO * 2;
  const BLOB_URL = "blob:svg";
  const SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"></svg>';
  const WIDTH = 100;
  const HEIGHT = 50;

  class ImageDouble {
    onload?: () => void;
    #source = "";

    get src() {
      return this.#source;
    }

    set src(source: string) {
      this.#source = source;
      queueMicrotask(() => {
        this.onload?.();
      });
    }
  }

  let drawImage: Mock<(image: unknown, x: number, y: number, width: number, height: number) => void>;
  let toBlob: Mock<(callback: BlobCallback, type: string) => void>;
  let canvas: {
    getContext: () => { drawImage: typeof drawImage };
    height: number;
    toBlob: typeof toBlob;
    width: number;
  };

  beforeEach(() => {
    drawImage = vi.fn<(image: unknown, x: number, y: number, width: number, height: number) => void>();
    toBlob = vi.fn<(callback: BlobCallback, type: string) => void>((callback) => {
      callback(new Blob([], { type: MimeType.Png }));
    });
    canvas = { getContext: () => ({ drawImage }), height: 0, toBlob, width: 0 };
    vi.stubGlobal("Image", ImageDouble);
    vi.stubGlobal("window", { devicePixelRatio: DEVICE_PIXEL_RATIO, document: { createElement: () => canvas } });
    vi.spyOn(URL, "createObjectURL").mockReturnValue(BLOB_URL);
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(noop);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test("the SVG exports to PNG at twice the device pixel density", async () => {
    expect.hasAssertions();

    await rasterizeSvg(new Blob([SVG], { type: MimeType.Svg }), WIDTH, HEIGHT);

    // The SVG that is loaded is the one given, and the canvas it is drawn on is the given size at the export's scale
    const [svgBlob] = vi.mocked(URL.createObjectURL).mock.lastCall ?? [];
    assert.instanceOf(svgBlob, Blob);
    await expect(svgBlob.text()).resolves.toBe(SVG);
    const [loadedImage] = drawImage.mock.lastCall ?? [];
    assert.instanceOf(loadedImage, ImageDouble);
    expect(drawImage).toHaveBeenCalledExactlyOnceWith(loadedImage, 0, 0, WIDTH * EXPORT_SCALE, HEIGHT * EXPORT_SCALE);
    const [callback] = toBlob.mock.lastCall ?? [];
    expect(callback).toBeTypeOf("function");
    expect(toBlob).toHaveBeenCalledExactlyOnceWith(callback, MimeType.Png);
  });
});

// @vitest-environment happy-dom
import { MAX_COLOR_CHANNEL } from "@/services/shared/constants";
import { getCanvasSrgbColor } from "@/services/shared/getCanvasSrgbColor";
import { afterEach, describe, expect, test, vi } from "vitest";

// The one-pixel canvas a browser draws the colour on, holding the sRGB channels of the colour as 8-bit values
const stubCanvasPixel = (channels: number[]) => {
  const context = {
    fillRect: vi.fn<(x: number, y: number, width: number, height: number) => void>(),
    fillStyle: "",
    getImageData: () => ({ data: new Uint8ClampedArray(channels) }),
  };
  vi.spyOn(window.HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  );
};

describe(getCanvasSrgbColor, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("a colour the browser computes in another space is read through a canvas", () => {
    expect.hasAssertions();

    stubCanvasPixel([MAX_COLOR_CHANNEL, 0, 0, MAX_COLOR_CHANNEL]);

    expect(getCanvasSrgbColor("oklch(0 0 0)")).toStrictEqual([1, 0, 0]);
  });

  test("a translucent colour is read as nothing", () => {
    expect.hasAssertions();

    stubCanvasPixel([0, 0, 0, 0]);

    expect(getCanvasSrgbColor("oklch(0 0 0)")).toBeUndefined();
  });
});

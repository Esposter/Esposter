import { PDF_MAX_CANVAS_AREA } from "@/services/pdf/constants";
import { getCanvasScale } from "@/services/pdf/getCanvasScale";
import { describe, expect, test } from "vitest";

describe("getCanvasScale", () => {
  const PAGE_HEIGHT = 792;
  const PAGE_WIDTH = 612;
  const PIXEL_RATIO = 2;

  test("draws a page at its screen width times the pixel ratio", () => {
    expect.hasAssertions();

    expect(
      getCanvasScale({ cssWidth: PAGE_WIDTH, pageHeight: PAGE_HEIGHT, pageWidth: PAGE_WIDTH, pixelRatio: PIXEL_RATIO }),
    ).toBe(PIXEL_RATIO);
  });

  // Safari on iOS refuses a canvas above its area and draws it blank, so the scale is lowered to the largest one it draws
  test("#52 caps the canvas area at the largest canvas a device draws", () => {
    expect.hasAssertions();

    const CSS_WIDTH = 4096;
    const scale = getCanvasScale({
      cssWidth: CSS_WIDTH,
      pageHeight: PAGE_HEIGHT,
      pageWidth: PAGE_WIDTH,
      pixelRatio: PIXEL_RATIO,
    });

    expect(PAGE_WIDTH * PAGE_HEIGHT * scale ** 2).toBeCloseTo(PDF_MAX_CANVAS_AREA);
  });
});

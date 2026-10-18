import { PDF_MAX_CANVAS_AREA } from "#src/services/constants";

interface Props {
  // The width the canvas is drawn at on screen, in CSS pixels
  cssWidth: number;
  pageHeight: number;
  pageWidth: number;
  pixelRatio: number;
}

// The scale a page is drawn at for a canvas whose screen width shows it sharp. A canvas past the largest one a device draws
// Is lowered to fit, which draws the page softer rather than leaving it blank
export const getCanvasScale = ({ cssWidth, pageHeight, pageWidth, pixelRatio }: Props): number => {
  const scale = (cssWidth / pageWidth) * pixelRatio;
  if (pageWidth * pageHeight * scale ** 2 <= PDF_MAX_CANVAS_AREA) return scale;

  return Math.sqrt(PDF_MAX_CANVAS_AREA / (pageWidth * pageHeight));
};

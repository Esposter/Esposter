import { PDF_MAX_CANVAS_AREA } from "@/services/pdf/constants";

interface Props {
  pageHeight: number;
  pageWidth: number;
  pixelRatio: number;
  // The width the canvas is drawn at on screen, in CSS pixels
  cssWidth: number;
}

// The scale a page is drawn at for a canvas its screen width shows sharp. Past the largest canvas a device draws, the
// Scale is lowered until the canvas fits, which draws it softer rather than leaving it blank
export const getCanvasScale = ({ cssWidth, pageHeight, pageWidth, pixelRatio }: Props) => {
  const scale = (cssWidth / pageWidth) * pixelRatio;
  if (pageWidth * pageHeight * scale ** 2 <= PDF_MAX_CANVAS_AREA) return scale;

  return Math.sqrt(PDF_MAX_CANVAS_AREA / (pageWidth * pageHeight));
};

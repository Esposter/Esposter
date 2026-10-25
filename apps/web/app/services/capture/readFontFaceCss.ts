import { getFontFaces } from "@/services/capture/getFontFaces";
import { inlineFontFace } from "@/services/capture/inlineFontFace";

export const readFontFaceCss = async () =>
  (await Promise.all(getFontFaces().map((rule) => inlineFontFace(rule)))).filter(Boolean).join("\n");

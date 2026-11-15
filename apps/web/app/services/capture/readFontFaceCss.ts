import { getFontFaces } from "#src/services/capture/getFontFaces";
import { inlineFontFace } from "#src/services/capture/inlineFontFace";

export const readFontFaceCss = async () =>
  (await Promise.all(getFontFaces().map((rule) => inlineFontFace(rule)))).filter(Boolean).join("\n");

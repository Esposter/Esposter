import { getFontFaces } from "@/services/resource/flowchart/getFontFaces";
import { inlineFontFace } from "@/services/resource/flowchart/inlineFontFace";

export const readFontFaceCss = async () =>
  (await Promise.all(getFontFaces().map((rule) => inlineFontFace(rule)))).filter(Boolean).join("\n");

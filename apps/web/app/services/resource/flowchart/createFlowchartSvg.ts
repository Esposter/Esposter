import { MimeType } from "#shared/models/file/MimeType";
import { escapeXml } from "#shared/util/text/escapeXml";
import { copyComputedStyles } from "@/services/resource/flowchart/copyComputedStyles";
import { readFontFaceCss } from "@/services/resource/flowchart/readFontFaceCss";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const createFlowchartSvg = async (element: HTMLElement) => {
  const { height, width } = element.getBoundingClientRect();
  if (!width || !height) throw new InvalidOperationError(Operation.Read, createFlowchartSvg.name, "Canvas has no size");
  const clone = element.cloneNode(true) as HTMLElement;
  copyComputedStyles(element, clone);
  const fontCss = escapeXml(await readFontFaceCss());
  const svgContent = new XMLSerializer().serializeToString(clone);
  return new Blob(
    [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><style>${fontCss}</style><foreignObject x="0" y="0" width="100%" height="100%">${svgContent}</foreignObject></svg>`,
    ],
    { type: MimeType.Svg },
  );
};

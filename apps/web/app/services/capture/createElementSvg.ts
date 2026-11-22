import { MimeType } from "#shared/models/file/MimeType";
import { copyComputedStyles } from "#src/services/capture/copyComputedStyles";
import { readFontFaceCss } from "#src/services/capture/readFontFaceCss";
import { escapeXml, InvalidOperationError, Operation } from "@esposter/shared";

export const createElementSvg = async (element: HTMLElement) => {
  const { height, width } = element.getBoundingClientRect();
  if (!width || !height) throw new InvalidOperationError(Operation.Read, createElementSvg.name, "Canvas has no size");
  const clone = element.cloneNode(true);
  // A clone of an element is an element, which cloneNode's Node return type does not carry
  if (!(clone instanceof HTMLElement))
    throw new InvalidOperationError(Operation.Read, createElementSvg.name, "Canvas clone is not an element");
  copyComputedStyles(element, clone);
  const fontCss = escapeXml(await readFontFaceCss());
  const svgContent = new XMLSerializer().serializeToString(clone);
  const svg = new Blob(
    [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><style>${fontCss}</style><foreignObject x="0" y="0" width="100%" height="100%">${svgContent}</foreignObject></svg>`,
    ],
    { type: MimeType.Svg },
  );
  return { height, svg, width };
};

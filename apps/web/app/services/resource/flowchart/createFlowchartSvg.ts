import { MimeType } from "#shared/models/file/MimeType";
import { InvalidOperationError, Operation } from "@esposter/shared";

const getCssText = (style: CSSStyleDeclaration) =>
  Array.from(style, (property) => `${property}:${style.getPropertyValue(property)}`).join(";");

const copyComputedStyles = (source: Element, target: Element) => {
  target.setAttribute("style", getCssText(window.getComputedStyle(source)));
  for (const [index, child] of [...source.children].entries()) {
    const clonedChild = target.children.item(index);
    if (clonedChild) copyComputedStyles(child, clonedChild);
  }
};

const getFontFaces = () => {
  const fontFaceRules: CSSFontFaceRule[] = [];
  const readRules = (rules: CSSRuleList) => {
    for (const rule of rules)
      if (rule.cssText.startsWith("@font-face")) fontFaceRules.push(rule as CSSFontFaceRule);
      else if ("cssRules" in rule) readRules((rule as CSSGroupingRule).cssRules);
  };
  for (const styleSheet of window.document.styleSheets) {
    if (styleSheet.href && new URL(styleSheet.href).origin !== window.location.origin) continue;
    readRules(styleSheet.cssRules);
  }
  return fontFaceRules;
};

const encodeBase64 = (bytes: Uint8Array) => {
  const chunkSize = 32_768;
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += chunkSize)
    binary += String.fromCodePoint(...bytes.subarray(offset, offset + chunkSize));
  return window.btoa(binary);
};

const inlineFontFace = async (rule: CSSFontFaceRule) => {
  const source = /url\((?<url>[^)]+)\)/u.exec(rule.style.getPropertyValue("src"))?.groups?.url;
  if (!source) return "";
  const fontUrl = new URL(
    source.replaceAll(/^['"]|['"]$/gu, ""),
    rule.parentStyleSheet?.href ?? window.document.baseURI,
  );
  if (fontUrl.protocol === "data:") return rule.cssText;
  const response = await fetch(fontUrl);
  if (!response.ok)
    throw new InvalidOperationError(Operation.Read, inlineFontFace.name, `Could not read font ${fontUrl.href}`);
  const contentType = response.headers.get("content-type") ?? "font/woff2";
  const fontData = encodeBase64(new Uint8Array(await response.arrayBuffer()));
  const descriptors = [...rule.style]
    .filter((property) => property !== "src")
    .map((property) => `${property}:${rule.style.getPropertyValue(property)}`);
  return `@font-face{${descriptors.join(";")};src:url("data:${contentType};base64,${fontData}")}`;
};

const readFontFaceCss = async () =>
  (await Promise.all(getFontFaces().map((rule) => inlineFontFace(rule)))).filter(Boolean).join("\n");

const escapeXml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

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

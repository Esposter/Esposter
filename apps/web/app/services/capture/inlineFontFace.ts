import { encodeBase64 } from "@/services/capture/encodeBase64";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const inlineFontFace = async (rule: CSSFontFaceRule) => {
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

import { decodeXmlText } from "#src/services/cutover/cloudflare/r2/decodeXmlText";

// The decoded text of the first element named `tag`, or "" when the answer has none. The tags read here are fixed names of
// S3's answers, so the pattern is built from them and never from input
export const readXmlElement = (xml: string, tag: string): string => {
  const match = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`).exec(xml);
  return decodeXmlText(match?.[1] ?? "");
};

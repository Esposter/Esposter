import { parseValue } from "@/lib/tmxParser/util/parseValue";
import parseDataUrl from "data-urls";
import { parseStringPromise } from "xml2js";

export const parseXmlString = async (xmlString: string) => {
  const xml = parseDataUrl(xmlString) ?? xmlString;
  return parseStringPromise(xml, {
    explicitChildren: true,
    preserveChildrenOrder: true,
    attrValueProcessors: [(value: string) => parseValue(value)],
  });
};

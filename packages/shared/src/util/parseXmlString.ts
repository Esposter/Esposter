import { parseXmlValue } from "@/util/parseXmlValue";
import parseDataUrl from "data-urls";
import { parseStringPromise } from "xml2js";

export const parseXmlString = (xmlString: string) => {
  const xml = parseDataUrl(xmlString) ?? xmlString;
  return parseStringPromise(xml, {
    attrValueProcessors: [(value: string) => parseXmlValue(value)],
    explicitChildren: true,
    preserveChildrenOrder: true,
  });
};

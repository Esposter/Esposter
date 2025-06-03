import { parseXmlValue } from "@/util/parseXmlValue";
import { parseStringPromise } from "@esposter/xml2js";
import parseDataUrl from "data-urls";

export const parseXmlString = <T extends object>(xmlString: string): Promise<T> => {
  const xml = parseDataUrl(xmlString) ?? xmlString;
  return parseStringPromise(xml, {
    attrValueProcessors: [(value: string) => parseXmlValue(value)],
    explicitChildren: true,
    preserveChildrenOrder: true,
  });
};

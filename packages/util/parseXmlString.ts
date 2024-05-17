import parseDataUrl from "data-urls";
import { parseValue } from "parse-tmx/util/parseValue";
import { parseStringPromise } from "xml2js";

export const parseXmlString = async (xmlString: string) => {
  const xml = parseDataUrl(xmlString) ?? xmlString;
  return parseStringPromise(xml, {
    explicitChildren: true,
    preserveChildrenOrder: true,
    attrValueProcessors: [(value: string) => parseValue(value)],
  });
};

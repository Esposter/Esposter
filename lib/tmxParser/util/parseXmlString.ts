import { isDataUrl } from "@/lib/tmxParser/util/isDataUrl";
import { parseValue } from "@/lib/tmxParser/util/parseValue";
import { parseStringPromise } from "xml2js";

export const parseXmlString = async (xmlString: string) => {
  let xml = xmlString;

  if (isDataUrl(xmlString)) {
    const response = await fetch(xmlString);
    xml = await response.text();
  }

  return parseStringPromise(xml, {
    explicitChildren: true,
    preserveChildrenOrder: true,
    attrValueProcessors: [(value: string) => parseValue(value)],
  });
};

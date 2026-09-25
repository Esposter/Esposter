import { parseXmlValue } from "#src/services/parseXmlValue";
import { parseStringPromise } from "@esposter/xml2js";

export const parseXmlString = <T extends object>(xmlString: string): Promise<T> =>
  parseStringPromise(xmlString, {
    attrValueProcessors: [(value) => parseXmlValue(value)],
    explicitChildren: true,
    preserveChildrenOrder: true,
  });

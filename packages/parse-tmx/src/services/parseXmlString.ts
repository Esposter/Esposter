import { parseXmlValue } from "#src/services/parseXmlValue";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { parseStringPromise } from "@esposter/xml2js";

export const parseXmlString = async <T extends object>(xmlString: string): Promise<T> => {
  const parsedXml = await parseStringPromise<T>(xmlString, {
    attrValueProcessors: [(value) => parseXmlValue(value)],
    explicitChildren: true,
    preserveChildrenOrder: true,
  });
  if (parsedXml === null) throw new InvalidOperationError(Operation.Read, parseXmlString.name, "has no root element");
  return parsedXml;
};

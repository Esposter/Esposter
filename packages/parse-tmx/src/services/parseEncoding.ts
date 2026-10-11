import { Encoding } from "#src/models/Encoding";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const parseEncoding = (value: string | undefined): Encoding | undefined => {
  if (value === undefined) return undefined;
  if (value === Encoding.Base64) return Encoding.Base64;
  else if (value === Encoding.Csv) return Encoding.Csv;
  throw new InvalidOperationError(Operation.Read, parseEncoding.name, `${value} is not a supported encoding`);
};

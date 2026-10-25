import { Encoding } from "#src/models/Encoding";
import { parseEnumAttribute } from "#src/services/parseEnumAttribute";

export const parseEncoding = (value: string | undefined): Encoding | undefined =>
  parseEnumAttribute(parseEncoding.name, "encoding", Encoding, value);

import { Encoding } from "#src/internal/models/Encoding";
import { parseEnumAttribute } from "#src/internal/services/parseEnumAttribute";

export const parseEncoding = (value: string | undefined): Encoding | undefined =>
  parseEnumAttribute(parseEncoding.name, "encoding", Encoding, value);

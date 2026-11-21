import { parseEnumAttribute } from "#src/internal/services/parseEnumAttribute";
import { PropertyType } from "#src/models/PropertyType";

// A property without a type is a string, as Tiled writes it
export const parsePropertyType = (value: string | undefined): PropertyType =>
  parseEnumAttribute(parsePropertyType.name, "property type", PropertyType, value) ?? PropertyType.String;

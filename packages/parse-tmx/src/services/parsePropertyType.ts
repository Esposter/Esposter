import { PropertyType } from "#src/models/PropertyType";
import { parseEnumAttribute } from "#src/services/parseEnumAttribute";

// A property without a type is a string, as Tiled writes it
export const parsePropertyType = (value: string | undefined): PropertyType =>
  parseEnumAttribute(parsePropertyType.name, "property type", PropertyType, value) ?? PropertyType.String;

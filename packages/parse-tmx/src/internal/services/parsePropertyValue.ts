import { PropertyType } from "#src/models/PropertyType";
import { exhaustiveGuard } from "@esposter/shared";

// A property's value read as its type says it is, so a string property holding "1" stays a string
export const parsePropertyValue = (propertyType: PropertyType, value: string): boolean | number | string => {
  switch (propertyType) {
    case PropertyType.Bool:
      return value === "true";
    case PropertyType.Class:
    case PropertyType.Color:
    case PropertyType.Enum:
    case PropertyType.File:
    case PropertyType.Object:
    case PropertyType.String:
      return value;
    case PropertyType.Float:
    case PropertyType.Int:
      return Number(value);
    default:
      return exhaustiveGuard(propertyType);
  }
};

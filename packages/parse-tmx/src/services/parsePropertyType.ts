import { PropertyType, PropertyTypes } from "#src/models/PropertyType";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A property without a type is a string, as Tiled writes it
export const parsePropertyType = (value: string | undefined): PropertyType => {
  if (value === undefined) return PropertyType.String;
  const propertyType = PropertyTypes.find((type) => type === value);
  if (propertyType === undefined)
    throw new InvalidOperationError(Operation.Read, parsePropertyType.name, `${value} is not a property type`);
  return propertyType;
};

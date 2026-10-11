export enum PropertyType {
  Bool = "bool",
  Class = "class",
  Color = "color",
  File = "file",
  Float = "float",
  Int = "int",
  Object = "object",
  String = "string",
}

export const PropertyTypes: readonly PropertyType[] = Object.values(PropertyType);

export const PropertyType = {
  Bool: "bool",
  Class: "class",
  Color: "color",
  Enum: "enum",
  File: "file",
  Float: "float",
  Int: "int",
  Object: "object",
  String: "string",
} as const;
export type PropertyType = (typeof PropertyType)[keyof typeof PropertyType];

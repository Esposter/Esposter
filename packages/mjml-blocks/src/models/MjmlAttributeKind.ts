export const MjmlAttributeKind = {
  Boolean: "boolean",
  Color: "color",
  Enum: "enum",
  Integer: "integer",
  String: "string",
  Unit: "unit",
} as const;
export type MjmlAttributeKind = (typeof MjmlAttributeKind)[keyof typeof MjmlAttributeKind];

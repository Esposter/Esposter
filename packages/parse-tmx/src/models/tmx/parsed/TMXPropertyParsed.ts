import type { TMXPropertiesParsed } from "#src/models/tmx/parsed/TMXPropertiesParsed";

export interface TMXPropertyParsed {
  name: string;
  // The properties of a class-typed property, which holds nested properties in place of a value
  properties?: TMXPropertiesParsed;
  value: boolean | number | string;
}

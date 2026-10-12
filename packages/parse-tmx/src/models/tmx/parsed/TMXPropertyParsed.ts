import type { TMXPropertiesParsed } from "#src/models/tmx/parsed/TMXPropertiesParsed";

export interface TMXPropertyParsed {
  name: string;
  // The properties nested under a class-typed property, which leaves its value empty
  properties?: TMXPropertiesParsed;
  value: boolean | number | string;
}

// The route segments of the blades a type declares in ResourceBladeDefinitionMap; the built-in ones every
// Resource has are ResourceBladeType, and no member here may collide with one of those.
export enum ResourceBladeSlug {
  Calendar = "calendar",
  Data = "data",
  Items = "items",
  Responses = "responses",
  Settings = "settings",
  Setup = "setup",
  Status = "status",
}

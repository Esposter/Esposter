// Where a place's footprint on the ground is read from, first that holds: a capital's city area, the building its kit
// Stands there, or the radius the ground's bar is read within
export enum GroundFootprintSource {
  BarRadius = "the bar's radius",
  BuildingKit = "its building kit",
  CityArea = "its city area",
}

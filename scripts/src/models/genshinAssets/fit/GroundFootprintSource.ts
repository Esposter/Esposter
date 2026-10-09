// Where a place's footprint on the ground is read from, first that holds: the building its kit stands there, the
// Capital's city area, or the radius the ground's bar is read within
export enum GroundFootprintSource {
  BarRadius = "the bar's radius",
  BuildingKit = "its building kit",
  CityArea = "its city area",
}

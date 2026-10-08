// One event an area's exploration counts, the game's own table naming its type and the weight it gives the area's total.
// Its params name the thing done: a waypoint's point, a chest's config and point, a camp's monster group
export interface ExcelWorldAreaExploreEventRow {
  AreaID: number;
  EventID: number;
  EventType: string;
  ExploreWeight: number;
  Param: string[];
  SceneID: number;
}

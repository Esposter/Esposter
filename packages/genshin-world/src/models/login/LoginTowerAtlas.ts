// The one canvas every login tower reads its surface from, in its pixels: each tower's facade side by side, its
// Column's left edge and breadth, and its height
export interface LoginTowerAtlas {
  height: number;
  tiles: Record<string, { height: number; width: number; x: number }>;
  width: number;
}

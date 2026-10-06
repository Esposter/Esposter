// A point of a scene whose place is known, as a share of one part's bounding box along each axis in three's axes (0
// Its least corner, 1 its greatest), the part named by the mesh it draws, and where a mesh stands many times (a tower),
// The one standing nearest the point given, in three's axes as the witness lays it out. An edge is a point on a round
// Part's silhouette, its bounding box's side halfway through its depth, which a reference pins across but not along
// The silhouette, so only its distance across counts. An interior point stands inside a face with no corner to snap
// To (a soft-edged slab's centre, a dish's middle), so it is read as given and both its axes count
export interface Landmark {
  isEdge?: true;
  isInterior?: true;
  mesh: string;
  near?: [number, number, number];
  share: [number, number, number];
}

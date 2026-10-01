// A point of a scene whose place is known, as a share of one part's bounding box along each axis in three's axes (0
// Its least corner, 1 its greatest), the part named by the mesh it draws, and where a mesh stands many times (a tower),
// The one standing nearest the point given, in three's axes as the witness lays it out
export interface Landmark {
  mesh: string;
  near?: [number, number, number];
  share: [number, number, number];
}

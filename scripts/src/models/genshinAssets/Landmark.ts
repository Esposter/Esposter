// A point of a scene whose place is known, as a share of one part's bounding box along each axis in three's axes (0
// Its least corner, 1 its greatest), the part named by the mesh it draws
export interface Landmark {
  mesh: string;
  share: [number, number, number];
}

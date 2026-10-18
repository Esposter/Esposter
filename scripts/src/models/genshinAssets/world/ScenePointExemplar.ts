// A point of the scene a reader takes as the exemplar of its kind: the point file of the community's dump, relative to its
// Folder, the point's category and id within it, and the fields of its kind holding its position and its Euler rotation
// In degrees, all named as that dump names them, so a dump that renames them is caught rather than misread
export interface ScenePointExemplar {
  category: string;
  file: string;
  id: string;
  position: string;
  rotation: string;
}

import { ResizeEdge } from "#src/models/ResizeEdge";

const HEIGHT_EDGES = new Set<ResizeEdge>([
  ResizeEdge.North,
  ResizeEdge.NorthEast,
  ResizeEdge.NorthWest,
  ResizeEdge.South,
  ResizeEdge.SouthEast,
  ResizeEdge.SouthWest,
]);

// Whether pulling an edge or corner changes an item's height, since a north, south or corner pull has a vertical part
export const checkChangesHeight = (edge: ResizeEdge): boolean => HEIGHT_EDGES.has(edge);

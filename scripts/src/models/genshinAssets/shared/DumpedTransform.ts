// A transform as AnimeStudio dumps it: its local position, rotation and scale, its father's and its children's path
// IDs, and its game object's, with the game object's name
export interface DumpedTransform {
  m_Children: { m_PathID: string }[];
  m_Father: { m_PathID: string };
  m_GameObject: { m_PathID: string; Name: string };
  m_LocalPosition: { X: number; Y: number; Z: number };
  m_LocalRotation: { W: number; X: number; Y: number; Z: number };
  m_LocalScale: { X: number; Y: number; Z: number };
}

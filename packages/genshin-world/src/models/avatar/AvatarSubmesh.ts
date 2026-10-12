// A run of a mesh's indices, from its first element for its count, drawn with one material by name
export interface AvatarSubmesh {
  count: number;
  material: string;
  start: number;
}

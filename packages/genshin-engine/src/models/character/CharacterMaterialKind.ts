// The game's own material kinds the character shader draws, each its own path through the shading: a body with its metal
// Branch, the hair without it, and the face shaded by its face map
export enum CharacterMaterialKind {
  Body = 0,
  Face = 1,
  Hair = 2,
}

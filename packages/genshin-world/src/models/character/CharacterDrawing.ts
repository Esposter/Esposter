// What a character on the field is drawn as: its official model once it is loaded, its capsule while the model loads, and
// Nothing where no model of it is held or the model fails to load
export enum CharacterDrawing {
  Capsule = "capsule",
  Model = "model",
  None = "none",
}

// What kind of the game's data a source is, as AnimeStudio exports it, a table of the community's dump of the game's
// Data, a sound of its Wwise packages, or a capture of the running game
export enum GameSourceKind {
  AnimationClip = "AnimationClip",
  BinaryData = "MiHoYoBinData",
  Capture = "Capture",
  DataTable = "DataTable",
  GameObject = "GameObject",
  Material = "Material",
  Mesh = "Mesh",
  MonoBehaviour = "MonoBehaviour",
  RectTransform = "RectTransform",
  Shader = "Shader",
  Sound = "Sound",
  TerrainData = "TerrainData",
  Texture = "Texture",
  Transform = "Transform",
}

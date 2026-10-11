// The kind a terrain tile's splat layer names, the material class the game's terrain shader draws it as. Read off every
// Region's tiles against their layers' diffuse textures: every kind-1 layer is a grass, kind 2 a soil or dirt, kind 3 a
// Stone, rock or gravel (the roads among them), kind 4 Windrise's one snow, kind 7 a sand and kind 22 Sumeru's desert
export enum TerrainSplatKind {
  Desert = 22,
  Grass = 1,
  Sand = 7,
  Snow = 4,
  Soil = 2,
  Stone = 3,
}

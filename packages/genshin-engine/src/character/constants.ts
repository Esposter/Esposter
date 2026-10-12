// MMD's unit in metres, eight centimetres, as its community reckons it by a model's height, so a model stands as tall in
// The world as it does in MMD
// Provisional: a character's height in the game's own model over its PMX's height in units measures it
export const PMX_UNIT_METRES = 0.08;
// The shade of each of MMD's ten shared toon ramps, toon01 to toon10 in a file's index, which the world generates in
// Its own tones rather than reading MMD's files: a shade is the share of the lit side a face in shadow still takes
export const SHARED_TOON_RAMP_SHADES: readonly number[] = [0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85];
// The share of a material's ambient colour its light adds where its file names a texture: the colour is lifted under the
// Texture rather than tinted by it, as three's MMD loader draws it, and the full colour where there is none
export const TEXTURED_AMBIENT_SHARE = 0.2;

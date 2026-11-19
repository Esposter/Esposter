// The shape of the game's bloom chain, each choice one its programs show (`Shader#90`) or one a recording can test. The
// Engine's own pair is GENSHIN_BLOOM_STRUCTURE, and `genshin:parity bloom-ablation` reads the other combinations
export interface GameBloomStructure {
  // The blur a level takes: the game's rotated four taps in one pass (`00000`), or the engine's separable pair of a row
  // And a column, four taps each
  blurForm: "rotated" | "separable";
  // How many times a level's blur is applied, a separable application being its row and then its column
  blurPasses: 1 | 2;
  // The prefilter: one tap thresholds each pixel (`00002`), or four taps average and the threshold is taken after (`00004`)
  prefilter: "fourTap" | "oneTap";
  // How far a downsample's taps, and a four-tap prefilter's, stand from their pixel in the source's texels: the game's
  // Programs read one texel (`00011`), where a bilinear tap spans the four texels of a level's pixel, and half a texel
  // Lands each tap on a texel's centre
  tapOffset: number;
}

// One renderer of the game's exports, named as its mesh and the materials it draws with, and what of the scene claims
// It: a family of its parts or a stand-in it draws by its own shaders, or a part named as not drawn yet, and no claim
// When nothing names it
export interface WitnessClaim {
  claim: string;
  isDrawn: boolean;
  renderer: string;
}

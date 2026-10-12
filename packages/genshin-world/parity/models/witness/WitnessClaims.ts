// What of a scene claims each renderer of one component's exports when a witness render draws them
export interface WitnessClaims {
  // The game's meshes each family of the scene's parts stands in for, which a witness render groups its exports by
  witnessFamilies?: Record<string, RegExp>;
  // The game's renderers the scene draws by its own shaders rather than a family's kit, and those it does not draw yet,
  // Each by what it is, matched as its mesh's name and its materials' joined by spaces: with its families, every
  // Renderer of its exports is claimed (the inventory pass)
  witnessStandIns?: Record<string, RegExp>;
  witnessUndrawn?: Record<string, RegExp>;
}

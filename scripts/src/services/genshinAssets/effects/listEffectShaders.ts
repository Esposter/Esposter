import type { ExportedShader } from "#src/models/genshinAssets/effects/ExportedShader";
import type { ShaderListing } from "#src/models/genshinAssets/effects/ShaderListing";

import { checkIsEffectPass } from "#src/services/genshinAssets/effects/checkIsEffectPass";

// Each exported shader listed with its keywords and its passes' state, and marked as an effect when one of its passes
// Draws with an effect's blend. A shader whose serialized form does not read is listed with no state, never a guessed one
export const listEffectShaders = (shaders: ExportedShader[]): ShaderListing[] =>
  shaders.map(({ block, folder, shader }) => {
    if (shader === undefined)
      return { block, folder, isEffect: false, isRead: false, keywords: [], name: "", passes: [] };
    const passes = shader.subShaders.flatMap((subShader) => subShader.passes);
    const keywords = passes.flatMap(({ subPrograms }) =>
      Object.values(subPrograms).flatMap((programs) => programs.flatMap((program) => program.keywords)),
    );
    return {
      block,
      folder,
      isEffect: passes.some(({ state }) => checkIsEffectPass(state)),
      isRead: true,
      keywords: [...new Set(keywords)].toSorted(),
      name: shader.name,
      passes: passes.map(({ name, state }) => ({ name, state })),
    };
  });

import type { KitEffect } from "#src/models/kit/KitEffect";

// The first source of a passive's stacks, named by its prefix and a count, that no buff of its character holds, so each
// Stack runs on a timer of its own. None once every one of the passive's maximum stacks holds its source
export const getFreeStackSource = (
  effects: readonly KitEffect[],
  characterId: number,
  sourcePrefix: string,
  maximumStacks: number,
): string | undefined => {
  const liveSources = new Set(
    effects.flatMap((effect) =>
      effect.kind === "buff" && effect.characterId === characterId && effect.source?.startsWith(sourcePrefix)
        ? [effect.source]
        : [],
    ),
  );
  return Array.from({ length: maximumStacks }, (_value, index) => `${sourcePrefix}${index}`).find(
    (stackSource) => !liveSources.has(stackSource),
  );
};

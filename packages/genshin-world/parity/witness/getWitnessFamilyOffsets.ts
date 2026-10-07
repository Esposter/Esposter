import type { SceneWitness } from "#src/models/scene/SceneWitness";

// How far the scene stands each family of the witness off its laid-out place in its current state, past any offset a
// Tool set: a row it scrolls, a lift it applies, a shift fitted to frames. The layout pass holds each against what the
// Game's own data explains
export const getWitnessFamilyOffsets = ({ parts }: SceneWitness): Record<string, [number, number, number]> =>
  Object.fromEntries(
    parts.children.map(({ name, position, userData }) => {
      const [x = 0, y = 0, z = 0] = (userData.offset as [number, number, number] | undefined) ?? [];
      return [name, [position.x - x, position.y - y, position.z - z]];
    }),
  );

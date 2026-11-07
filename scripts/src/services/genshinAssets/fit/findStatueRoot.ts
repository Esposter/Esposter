import { STATUE_FIGURE_MESH_REGEX, STATUE_MESH_REGEX } from "#src/services/genshinAssets/shared/constants";

// A component's statue root: the Goddess stone mesh of its statue meshes that its figure's pattern does not name, which
// The statue is set down by. A component whose layout places no such mesh has no statue, so it has no root
export const findStatueRoot = <T extends { mesh: string }>(placements: readonly T[]): T | undefined =>
  placements.find(({ mesh }) => STATUE_MESH_REGEX.test(mesh) && !STATUE_FIGURE_MESH_REGEX.test(mesh));

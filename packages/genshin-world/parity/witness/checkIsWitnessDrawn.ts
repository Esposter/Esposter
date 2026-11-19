import { WitnessRole } from "#parity/models/witness/WitnessRole";

// Whether a witness read draws an object of the scene, given its role. The exports' read draws each family group the
// View lists, whether the scene has hidden the group or not, since the scene hides an export its copies ride instead.
// The scene's read draws our own pieces and never a copy that rides an export, which would draw the export a second
// Time under our piece's own place. Nothing else is drawn by either read
export const checkIsWitnessDrawn = ({
  family,
  isScene,
  role,
  viewFamilies,
}: {
  family: string;
  isScene: boolean;
  role: WitnessRole;
  viewFamilies: readonly string[];
}): boolean => {
  if (role === WitnessRole.RideCopy) return false;
  if (isScene) return role === WitnessRole.Ours;
  return role === WitnessRole.Export && viewFamilies.includes(family);
};

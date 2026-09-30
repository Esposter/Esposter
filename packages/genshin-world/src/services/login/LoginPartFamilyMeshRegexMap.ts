import { LoginPartFamily } from "#src/models/login/LoginPartFamily";

// The game's meshes each family of the login scene's parts stands in for, by name: its towers, the walkway, the arched
// Bridges with the pillars under them, and the door
export const LoginPartFamilyMeshRegexMap: Record<LoginPartFamily, RegExp> = {
  [LoginPartFamily.Bridges]: /^LoginScene_(?:Bridge0[2-4]|Pillar)/u,
  [LoginPartFamily.Door]: /^LoginScene_Door/u,
  [LoginPartFamily.Towers]: /^LoginScene_Build/u,
  [LoginPartFamily.Walkway]: /^LoginScene_Bridge01_/u,
};

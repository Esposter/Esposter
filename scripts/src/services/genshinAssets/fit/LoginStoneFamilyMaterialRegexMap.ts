// Each family of the login's parts by the materials it draws with, as the materials are named
export const LoginStoneFamilyMaterialRegexMap: Record<"bridges" | "door" | "towers" | "walkway", RegExp> = {
  bridges: /^LoginScene_(?:Bridge0[2-4]|Pillar|Broken)/u,
  door: /^LoginScene_Door/u,
  towers: /^LoginScene_Build/u,
  walkway: /^LoginScene_Bridge01/u,
};

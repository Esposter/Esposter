// Each family of the login's parts by the materials it draws with, as the materials are named, and the door's frame
// And its panel each by its own, which glow apart
export const LoginStoneFamilyMaterialRegexMap: Record<"bridges" | "door" | "doorPanel" | "towers" | "walkway", RegExp> =
  {
    bridges: /^LoginScene_(?:Bridge0[2-4]|Pillar|Broken)/u,
    door: /^LoginScene_Door01/u,
    doorPanel: /^LoginScene_Door02/u,
    towers: /^LoginScene_Build/u,
    walkway: /^LoginScene_Bridge01/u,
  };

// Each family of the login's parts by the materials it draws with, as the materials are named: the door's frame and
// Its panel each by its own, which glow apart, and the walkway's borders, curbs and sides and its middle lane by
// Their own, which glow where its stone does not
export const LoginStoneFamilyMaterialRegexMap: Record<
  "bridges" | "door" | "doorPanel" | "towers" | "walkway" | "walkwayEdge" | "walkwayLane",
  RegExp
> = {
  bridges: /^LoginScene_(?:Bridge0[2-4]|Pillar|Broken)/u,
  door: /^LoginScene_Door01/u,
  doorPanel: /^LoginScene_Door02/u,
  towers: /^LoginScene_Build/u,
  walkway: /^LoginScene_Bridge01/u,
  walkwayEdge: /^LoginScene_Edge01/u,
  walkwayLane: /^LoginScene_Ground02/u,
};

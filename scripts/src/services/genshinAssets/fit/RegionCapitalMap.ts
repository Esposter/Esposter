import type { RegionCapital } from "#src/models/genshinAssets/world/RegionCapital";

// Each region's first landmark by its region data file's id, and the areas whose waypoints place it: the capital, or
// For Natlan, the first tribe the game enters it through. Snezhnaya's areas are not in the community's dump yet
export const RegionCapitalMap: Record<string, RegionCapital> = {
  fontaine: { areaNames: ["Court of Fontaine"], landmarkId: "court-of-fontaine" },
  inazuma: { areaNames: ["Inazuma City"], landmarkId: "inazuma-city" },
  liyue: { areaNames: ["Liyue Harbor"], landmarkId: "liyue-harbor" },
  mondstadt: { areaNames: ["Mondstadt"], landmarkId: "mondstadt-city" },
  natlan: { areaNames: ['"People of the Springs"'], landmarkId: "people-of-the-springs" },
  "nod-krai": { areaNames: ["Nasha Town"], landmarkId: "nasha-town" },
  sumeru: { areaNames: ["Sumeru City"], landmarkId: "sumeru-city" },
};

import type { RegionCapital } from "#src/models/genshinAssets/world/RegionCapital";

// Each region's first landmark by its region data file's id, and the areas whose waypoints place it: the capital, or
// For Natlan, the first tribe the game enters it through. Snezhnaya's areas are not in the community's dump yet, so its
// Capital is set at the place the scene has always been set at by hand. Each capital's city area is found by its place
// (`readCapitalCityCode`)
export const RegionCapitalMap: Record<string, RegionCapital> = {
  fontaine: { areaNames: ["Court of Fontaine"], landmarkId: "court-of-fontaine" },
  inazuma: { areaNames: ["Inazuma City"], landmarkId: "inazuma-city" },
  liyue: { areaNames: ["Liyue Harbor"], landmarkId: "liyue-harbor" },
  mondstadt: { areaNames: ["Mondstadt"], landmarkId: "mondstadt-city" },
  natlan: { areaNames: ['"People of the Springs"'], landmarkId: "people-of-the-springs" },
  "nod-krai": { areaNames: ["Nasha Town"], landmarkId: "nasha-town" },
  snezhnaya: { landmarkId: "snezhnograd", position: { x: 3750, z: -10730 } },
  sumeru: { areaNames: ["Sumeru City"], landmarkId: "sumeru-city" },
};

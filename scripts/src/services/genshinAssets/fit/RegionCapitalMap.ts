import type { RegionCapital } from "#src/models/genshinAssets/world/RegionCapital";

// Each region's first landmark by its region data file's id, and the areas whose waypoints place it: the capital, or
// For Natlan, the first tribe the game enters it through. Snezhnaya's areas are not in the community's dump yet, so its
// Capital is set at the place the scene has always been set at by hand. Each capital's city area is the code of its own
// StreamGen blob (`Area_<code>_City`), which holds the city's props and buildings: Mondstadt's and Liyue's are checked
// Against their city's placements, the rest are not yet found, so their blob is "" and the derivation reads none
export const RegionCapitalMap: Record<string, RegionCapital> = {
  fontaine: { areaNames: ["Court of Fontaine"], cityArea: "", landmarkId: "court-of-fontaine" },
  inazuma: { areaNames: ["Inazuma City"], cityArea: "", landmarkId: "inazuma-city" },
  liyue: { areaNames: ["Liyue Harbor"], cityArea: "LYG", landmarkId: "liyue-harbor" },
  mondstadt: { areaNames: ["Mondstadt"], cityArea: "Mengde", landmarkId: "mondstadt-city" },
  natlan: { areaNames: ['"People of the Springs"'], cityArea: "", landmarkId: "people-of-the-springs" },
  "nod-krai": { areaNames: ["Nasha Town"], cityArea: "", landmarkId: "nasha-town" },
  snezhnaya: { cityArea: "", landmarkId: "snezhnograd", position: { x: 3750, z: -10730 } },
  sumeru: { areaNames: ["Sumeru City"], cityArea: "", landmarkId: "sumeru-city" },
};

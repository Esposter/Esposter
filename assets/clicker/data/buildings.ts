import { Building, BuildingName } from "@/models/clicker";

export const buildings: Building[] = [
  {
    name: BuildingName.Cursor,
    flavorDescription: "Autoclicks once every 10 seconds.",
    basePrice: 15,
    baseValue: 1e-1,
  },
];

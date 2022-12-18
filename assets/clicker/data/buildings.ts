import { Building, UpgradeName } from "@/models/clicker";

export const buildings: Building[] = [
  {
    name: UpgradeName.Cursor,
    flavorDescription: "Autoclicks once every 10 seconds.",
    basePrice: 15,
    baseValue: 0.1,
    level: 1,
  },
];

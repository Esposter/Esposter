import { decompileVariable } from "@/services/clicker/compiler/decompileVariable";

export const useReadBuildings = async () => {
  const { $client } = useNuxtApp();
  const buildings = await $client.clicker.readBuildings.query();
  return buildings.map((b) => ({
    ...b,
    flavorDescription: decompileVariable(b.flavorDescription),
  }));
};

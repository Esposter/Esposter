import { decompileVariable } from "@/services/clicker/compiler/decompileVariable";

export const useReadUpgrades = async () => {
  const { $client } = useNuxtApp();
  const upgrades = await $client.clicker.readUpgrades.query();
  return upgrades.map((u) => ({
    ...u,
    description: decompileVariable(u.description),
    flavorDescription: decompileVariable(u.flavorDescription),
  }));
};

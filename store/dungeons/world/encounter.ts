export const useEncounterStore = defineStore("dungeons/world/encounter", () => {
  const stepsSinceLastEncounter = ref(0);
  const isMonsterEncountered = ref(false);
  return { stepsSinceLastEncounter, isMonsterEncountered };
});

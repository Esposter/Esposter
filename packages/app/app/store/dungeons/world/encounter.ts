export const useEncounterStore = defineStore("dungeons/world/encounter", () => {
  const stepsSinceLastEncounter = ref(0);
  return { stepsSinceLastEncounter };
});

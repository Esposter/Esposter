import type { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";

import { ref } from "vue";

// The artifact picker the Artifacts panel's Equip and Enhance buttons open, and the notice the panel shows, which the
// Character screen's overlays read
export const useCharacterArtifactPicker = () => {
  // The slot each picker is open for: the Artifacts panel's Equip and Enhance buttons open it, and the picker's close clears it
  const equipSlot = ref<ArtifactSlot>();
  const enhanceSlot = ref<ArtifactSlot>();
  // The bag's artifacts chosen as fodder and the ore counts chosen by item id, which the Artifacts panel's Enhance button
  // Clears each time it opens the picker, so a choice never carries over from one enhancement to the next
  const enhanceFodderIds = ref<number[]>([]);
  const enhanceMaterialCounts = ref<Record<number, number>>({});
  // The notice the artifact panel shows, the game's card for a refusal, kept across tabs until the next artifact action
  const artifactNotice = ref("");
  return { artifactNotice, enhanceFodderIds, enhanceMaterialCounts, enhanceSlot, equipSlot };
};

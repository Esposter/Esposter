import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { GameTextKey } from "genshin-text";

// Each artifact slot by the game's name for it
export const ArtifactSlotGameTextKeyMap = {
  [ArtifactSlot.CircletOfLogos]: GameTextKey.ArtifactSlotCircletOfLogos,
  [ArtifactSlot.FlowerOfLife]: GameTextKey.ArtifactSlotFlowerOfLife,
  [ArtifactSlot.GobletOfEonothem]: GameTextKey.ArtifactSlotGobletOfEonothem,
  [ArtifactSlot.PlumeOfDeath]: GameTextKey.ArtifactSlotPlumeOfDeath,
  [ArtifactSlot.SandsOfEon]: GameTextKey.ArtifactSlotSandsOfEon,
} as const satisfies Record<ArtifactSlot, GameTextKey>;

import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";
import type { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import type { Character } from "#src/models/character/Character";
import type { Wallet } from "#src/models/inventory/Wallet";

import { Currency } from "#src/models/inventory/Currency";
import { enhanceArtifact } from "#src/services/artifact/enhanceArtifact";
import { getEnhancementMoraCost } from "#src/services/artifact/getEnhancementMoraCost";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A worn artifact enhanced with materials and fodders from the bag, the caller's. The Mora is checked before anything
// Changes, so a wallet short of it refuses the enhancement and leaves the character and the wallet as they were
export const enhanceCharacterArtifact = (
  character: Character,
  slot: ArtifactSlot,
  {
    artifactRarityDataMap,
    fodders,
    materialExperience,
    random,
    wallet,
  }: {
    artifactRarityDataMap: ReadonlyMap<number, ArtifactRarityData>;
    fodders: readonly Artifact[];
    materialExperience: number;
    random: () => number;
    wallet: Wallet;
  },
): { character: Character; wallet: Wallet } => {
  const artifact = character.artifacts.find((worn) => worn.slot === slot);
  if (!artifact)
    throw new InvalidOperationError(Operation.Update, enhanceCharacterArtifact.name, `no artifact in ${slot}`);
  const moraCost = getEnhancementMoraCost({ artifactRarityDataMap, fodders, materialExperience });
  if (wallet[Currency.Mora] < moraCost)
    throw new InvalidOperationError(Operation.Update, enhanceCharacterArtifact.name, `${moraCost} Mora`);
  const enhanced = enhanceArtifact({ artifact, artifactRarityDataMap, fodders, materialExperience, random });
  return {
    character: { ...character, artifacts: character.artifacts.map((worn) => (worn === artifact ? enhanced : worn)) },
    wallet: { ...wallet, [Currency.Mora]: wallet[Currency.Mora] - moraCost },
  };
};

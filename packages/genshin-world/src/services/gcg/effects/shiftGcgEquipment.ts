import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { takeOne } from "@esposter/shared";

// A card that shifts one equipment of a kind from one of its side's characters to the character chosen, which holds none of
// That kind. A weapon moves only to a character of its weapon type, and an artifact to any other. The moved equipment's
// Once-a-round limit is reset, so it may be used again on its new character
export const createGcgEquipmentShift = (kind: GcgCardKind): Pick<GcgCardModule, "canPlay" | "play"> => ({
  canPlay: ({ duel, sideIndex }, targetIndex) =>
    findGcgShiftSource(takeOne(duel.sides, sideIndex), kind, targetIndex) !== undefined,
  play: ({ duel, sideIndex }, targetIndex) => {
    const side = takeOne(duel.sides, sideIndex);
    const source = findGcgShiftSource(side, kind, targetIndex);
    if (!source || targetIndex === undefined) return;
    const sourceCharacter = takeOne(side.characters, source.characterIndex);
    const zoneCard = sourceCharacter.equipments.at(source.equipmentIndex);
    if (!zoneCard) return;
    sourceCharacter.equipments = sourceCharacter.equipments.toSpliced(source.equipmentIndex, 1);
    takeOne(side.characters, targetIndex).equipments.push(zoneCard);
    side.usedCardIds = side.usedCardIds.filter((cardId) => cardId !== zoneCard.cardId);
  },
});

// The first equipment of the kind a standing character other than the target holds, that the target may take, with where
// It sits
const findGcgShiftSource = (
  side: GcgSideState,
  kind: GcgCardKind,
  targetIndex: number | undefined,
): undefined | { characterIndex: number; equipmentIndex: number } => {
  const target = targetIndex === undefined ? undefined : side.characters.at(targetIndex);
  if (!target || target.hp <= 0 || holdsGcgEquipment(side, target.equipments, kind)) return undefined;
  for (const [characterIndex, character] of side.characters.entries()) {
    if (characterIndex === targetIndex || character.hp <= 0) continue;
    if (kind === GcgCardKind.Weapon && character.character.weapon !== target.character.weapon) continue;
    const equipmentIndex = character.equipments.findIndex(
      (zoneCard) => side.cards.find(({ id }) => id === zoneCard.cardId)?.kind === kind,
    );
    if (equipmentIndex !== -1) return { characterIndex, equipmentIndex };
  }
  return undefined;
};

const holdsGcgEquipment = (side: GcgSideState, equipments: GcgZoneCard[], kind: GcgCardKind): boolean =>
  equipments.some((zoneCard) => side.cards.find(({ id }) => id === zoneCard.cardId)?.kind === kind);

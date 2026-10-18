// The character each passive group belongs to, from every character's passives: a group several characters name (the
// Higher ids are variant forms that share their base character's passives) goes to the lowest id, the base character
export const toCookingTalentOwnerMap = (
  characterTalentKits: { characterId: number; passives: { proudSkillGroupId: number }[] }[],
): Map<number, number> => {
  const ownerMap = new Map<number, number>();
  for (const { characterId, passives } of characterTalentKits)
    for (const { proudSkillGroupId } of passives) {
      const ownerId = ownerMap.get(proudSkillGroupId);
      if (ownerId === undefined || characterId < ownerId) ownerMap.set(proudSkillGroupId, characterId);
    }
  return ownerMap;
};

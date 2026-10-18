// The id of a half's camp, which names it apart from the camps of every other half and of every other entry of the chamber
export const getAbyssCampId = (startedAt: number, halfIndex: number): string => `abyss-${startedAt}-${halfIndex}`;

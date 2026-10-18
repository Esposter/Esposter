// The one key a quest's step is held under, in the maps that follow the step the quest is on
export const getQuestStepKey = (questId: string, stepIndex: number): string => `${questId}/${stepIndex}`;

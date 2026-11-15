// What a line of a talk is: spoken, by a character or a narrator, or one of the Traveler's replies, which the game
// Never speaks as a line but offers as a choice
export const TalkLineKind = { Choice: "Choice", Spoken: "Spoken" } as const;
export type TalkLineKind = (typeof TalkLineKind)[keyof typeof TalkLineKind];

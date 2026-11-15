// The moves a node takes from where it sits: a step up or down among its siblings, into the element before it, or out of its parent
export const SurveyNodeMoveType = { Down: "down", IntoPrevious: "intoPrevious", Out: "out", Up: "up" } as const;
export type SurveyNodeMoveType = (typeof SurveyNodeMoveType)[keyof typeof SurveyNodeMoveType];

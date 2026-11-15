export const PlayerTitleMenuOption = { Continue: "Continue", "New Game": "New Game", Settings: "Settings" } as const;
export type PlayerTitleMenuOption = (typeof PlayerTitleMenuOption)[keyof typeof PlayerTitleMenuOption];

export const PlayerSpecialInput = { Cancel: "Cancel", Confirm: "Confirm", Enter: "Enter" } as const;
export type PlayerSpecialInput = (typeof PlayerSpecialInput)[keyof typeof PlayerSpecialInput];

export const PlayerSpecialInputs: ReadonlySet<PlayerSpecialInput> = new Set(Object.values(PlayerSpecialInput));

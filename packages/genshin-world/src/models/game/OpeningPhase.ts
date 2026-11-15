// The screens the game opens on, in the order it shows them
export const OpeningPhase = { Loading: "Loading", Login: "Login", Splash: "Splash" } as const;
export type OpeningPhase = (typeof OpeningPhase)[keyof typeof OpeningPhase];

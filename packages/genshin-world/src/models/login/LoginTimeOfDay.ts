// The four skies the login screen is shown under, by the hour the player starts the game in
export const LoginTimeOfDay = { Dawn: "Dawn", Day: "Day", Dusk: "Dusk", Night: "Night" } as const;
export type LoginTimeOfDay = (typeof LoginTimeOfDay)[keyof typeof LoginTimeOfDay];

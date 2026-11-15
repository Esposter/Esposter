// A family of the login scene's parts, which the scene builds with one kit each and a witness render can draw in its
// Place from the game's exports
export const LoginPartFamily = { Bridges: "Bridges", Door: "Door", Towers: "Towers", Walkway: "Walkway" } as const;
export type LoginPartFamily = (typeof LoginPartFamily)[keyof typeof LoginPartFamily];

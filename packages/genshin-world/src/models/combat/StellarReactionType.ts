// The reactions the Stellar Jubilee passives of a party's Stellar Linchpin users enable: a Cryo Swirl becomes Stellar
// Swirl, and a Superconduct becomes Stellar-Conduct
export const StellarReactionType = { StellarConduct: "StellarConduct", StellarSwirl: "StellarSwirl" } as const;
export type StellarReactionType = (typeof StellarReactionType)[keyof typeof StellarReactionType];

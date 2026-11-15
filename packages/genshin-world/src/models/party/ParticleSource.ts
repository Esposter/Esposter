// A source of particles a team's Resonance drops, each with a cooldown of its own that the team keeps
export const ParticleSource = { HighVoltage: "HighVoltage" } as const;
export type ParticleSource = (typeof ParticleSource)[keyof typeof ParticleSource];

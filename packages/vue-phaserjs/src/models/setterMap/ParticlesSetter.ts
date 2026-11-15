export const ParticlesSetter = { Configuration: "config" } as const;
export type ParticlesSetter = (typeof ParticlesSetter)[keyof typeof ParticlesSetter];

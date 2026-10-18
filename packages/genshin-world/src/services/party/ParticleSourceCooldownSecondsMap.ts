import { ParticleSource } from "#src/models/party/ParticleSource";

// The seconds a source waits between its particles: High Voltage's five, as the Team Bonus and Energy pages give it
export const ParticleSourceCooldownSecondsMap: Readonly<Record<ParticleSource, number>> = {
  [ParticleSource.HighVoltage]: 5,
};

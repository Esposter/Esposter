import { LIGHTNING_FLASH_DECAY_SECONDS, LIGHTNING_FLASH_PULSES } from "#src/atmosphere/constants";

// How bright a strike's flash stands a while after it, from none to about one: its pulses, each lighting at its time
// And dying away, summed, so the sky flickers twice as a strike's does and is dark again within a second
export const computeLightningFlash = (elapsed: number): number => {
  let flash = 0;
  for (const { seconds, strength } of LIGHTNING_FLASH_PULSES)
    if (elapsed >= seconds) flash += strength * Math.exp(-(elapsed - seconds) / LIGHTNING_FLASH_DECAY_SECONDS);
  return flash;
};

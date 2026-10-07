// Sounds' band powers played together, each from its own frame on: noise apart adds its power, so the sum is frame by
// Frame and band by band, as long as the last of them sounds
export const sumSoundBandPowers = (sounds: readonly { offsetFrames: number; powers: number[][] }[]): number[][] => {
  const frameCount = Math.max(0, ...sounds.map(({ offsetFrames, powers }) => offsetFrames + powers.length));
  const bandCount = Math.max(0, ...sounds.flatMap(({ powers }) => powers.map((bands) => bands.length)));
  const sum = Array.from({ length: frameCount }, () => Array.from({ length: bandCount }, () => 0));
  for (const { offsetFrames, powers } of sounds)
    for (const [frame, bands] of powers.entries())
      for (const [band, power] of bands.entries()) {
        const sumBands = sum[offsetFrames + frame];
        if (sumBands) sumBands[band] = (sumBands[band] ?? 0) + power;
      }
  return sum;
};

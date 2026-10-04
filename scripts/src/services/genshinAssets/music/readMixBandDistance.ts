// The listening score's band distance of a mix from the game's sound: each voice's band energies, `frameCount` frames
// A band after another, scaled by its power and summed, against the game's, both floored at its band's floor, as the
// Mean over the bands of each one's mean gap in decibels
export const readMixBandDistance = (
  voiceEnergies: Float64Array[],
  powers: number[],
  targets: Float64Array,
  floors: number[],
  frameCount: number,
): number => {
  let distance = 0;
  for (const [band, floor] of floors.entries()) {
    let gaps = 0;
    for (let frame = 0; frame < frameCount; frame++) {
      const index = band * frameCount + frame;
      let energy = 0;
      for (const [voice, energies] of voiceEnergies.entries()) energy += (powers[voice] ?? 0) * (energies[index] ?? 0);
      gaps += Math.abs(10 * Math.log10(Math.max(energy, floor) / (targets[index] ?? floor)));
    }
    distance += gaps / Math.max(frameCount, 1);
  }
  return distance / Math.max(floors.length, 1);
};

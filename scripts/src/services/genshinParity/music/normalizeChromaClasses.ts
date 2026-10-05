// Each frame's twelve pitch-class weights, in place, less their mean and scaled to unit length, so a frame of no pitch
// Reads as zeros and two frames compare by their dot product
export const normalizeChromaClasses = (classes: Float32Array): void => {
  for (let offset = 0; offset < classes.length; offset += 12) {
    const frameClasses = classes.subarray(offset, offset + 12);
    const mean = frameClasses.reduce((sum, value) => sum + value, 0) / 12;
    for (const [index, value] of frameClasses.entries()) frameClasses[index] = value - mean;
    const norm = Math.hypot(...frameClasses) || 1;
    for (const [index, value] of frameClasses.entries()) frameClasses[index] = value / norm;
  }
};

// An instrument's harmonics as an oscillator's waveform, each a sine at its multiple of the fundamental, left
// Unnormalised so the fundamental plays at the amplitude its gain gives it
export const createInstrumentWave = (context: BaseAudioContext, harmonics: number[]): PeriodicWave =>
  context.createPeriodicWave(new Float32Array(harmonics.length + 1), Float32Array.of(0, ...harmonics), {
    disableNormalization: true,
  });

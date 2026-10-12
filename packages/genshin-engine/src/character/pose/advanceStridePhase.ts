// The stride's phase in radians after a frame of `delta` seconds at `speed`, a full turn for every stride of
// `strideMetres`, so its frequency is the speed over the stride and the feet keep pace with the ground they cover
export const advanceStridePhase = (stridePhase: number, speed: number, strideMetres: number, delta: number): number =>
  stridePhase + (Math.PI * 2 * speed * delta) / strideMetres;

// One animation frame the parity page drew: when it was drawn, and how many programs the renderer then held
export interface FrameSample {
  programs: number | null;
  time: number;
}

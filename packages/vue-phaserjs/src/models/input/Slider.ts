export interface Slider {
  destroy: () => void;
  // From 0 at the slider's start to 1 at its end; setting it moves the thumb without reporting the change back
  value: number;
}

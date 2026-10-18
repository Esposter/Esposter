// A place on the map as a pin: its id, its name read to assistive technology, where its pin stands in the frame at 1080
// High from the frame's left and its top, and the time left on the expedition away from it, empty while none is out
export interface ExpeditionPin {
  awayLabel: string;
  id: number;
  label: string;
  x: number;
  y: number;
}

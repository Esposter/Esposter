// A place on the map as a pin: its id, its name read to assistive technology, and where its pin stands in the frame
// At 1080 high, from the frame's left and its top
export interface ExpeditionPin {
  id: number;
  label: string;
  x: number;
  y: number;
}

// The page a stall run measures: the screen, its viewport in CSS pixels and the device's ratio, and whether each GPU
// Call is traced
export interface StallOptions {
  height: number;
  scale: number;
  screen: string;
  trace: boolean;
  width: number;
}

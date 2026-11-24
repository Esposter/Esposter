// A keyboard step: the whole cells an item moves by and the whole cells its span grows by.
// Each is zero when it is not given
export interface GridStep {
  dh?: number;
  dw?: number;
  dx?: number;
  dy?: number;
}

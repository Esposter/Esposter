// Steady mode reviews what `ai/queue` holds past `main`; range mode reviews an explicit `from..to` and never moves `main`
export enum ReviewMode {
  Range = "range",
  Steady = "steady",
}

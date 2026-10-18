// How full an area's load meter reads: green under its orange load, orange from there to its red load, and red from its red
// Load up to the area's load limit, past which the realm refuses a placement
export enum HomeLoadState {
  Green = "Green",
  Orange = "Orange",
  Red = "Red",
}

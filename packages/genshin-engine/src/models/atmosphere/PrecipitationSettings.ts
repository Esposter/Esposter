// How one kind of particle falls: its speed down under no wind, how far the wind carries it per metre a second of
// It, the streak's length and width in metres, how far it sways side to side, and its opacity
export interface PrecipitationSettings {
  fallSpeed: number;
  length: number;
  opacity: number;
  sway: number;
  width: number;
  windDrift: number;
}

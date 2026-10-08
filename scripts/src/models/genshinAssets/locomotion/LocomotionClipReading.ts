// What a locomotion clip's root does over it: the clip's name and seconds, how far the root travels across the ground
// From where it starts to where it stops and how far it rises, its speed across the ground over the clip, and the
// Average speed across the ground the clip itself records, not a number where it records none
export interface LocomotionClipReading {
  averageGroundSpeed: number;
  duration: number;
  groundDistance: number;
  groundSpeed: number;
  name: string;
  rise: number;
}

// A bolt's shape: how many branches fork from its channel, its height from the ground up to the cloud base in metres,
// How far each segment wanders sideways for its length, its seed, how many segments its channel climbs in, and its
// Width at the ground in metres
export interface LightningBoltOptions {
  branchCount: number;
  height: number;
  roughness: number;
  seed: number;
  segmentCount: number;
  width: number;
}

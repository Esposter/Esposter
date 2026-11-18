export interface SelectRetiredGroundKeysOptions {
  // The surface areas the catalogue outlines for the region, each one a piece of its ground
  areaIds: string[];
  // The lock's keys before the publish
  lockKeys: string[];
  // The keys the publish stores
  publishedKeys: string[];
  region: string;
}

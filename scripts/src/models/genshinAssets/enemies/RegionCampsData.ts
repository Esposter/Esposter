// The enemy camps one region's data places, each member the kind it spawns, read off the region's own record
export interface RegionCampsData {
  enemyCamps: { members: { enemyKindId: number }[] }[];
}

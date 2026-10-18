import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";

// The open-world place the player went into the realm from: the region it stands in and the pose the player was at
// There. The realm's gadget and every teleport out of it return the player to this place
export interface HomeRealmVisit {
  pose: WorldJumpPose;
  regionId: string;
}

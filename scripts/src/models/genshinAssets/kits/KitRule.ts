// A builder rule that gives a value of a kit's record no source reads
export enum KitRule {
  // A plunge's collision strikes as the plunge falls, so its hit lands as the fall starts
  CollisionHitmark = "CollisionHitmark",
  // A talent whose hits its module spawns as a named list has no hits of its own, whatever gcsim's list gives
  // A burst's first hit deals the character's element, which is its energy's, as the table gives the character
  EnergyElement = "EnergyElement",
  NamedHitList = "NamedHitList",
  // A plunge gcsim has no file for strikes once as it lands and ends 24 frames on, and a claymore's charged attack it
  // Has no file for spins at 30 frames, deals its final blow at 60 and ends at 72
  NoActionFile = "NoActionFile",
  // A skill no source gives a hold has none
  NoHold = "NoHold",
  // A hit no source gives poise for deals none
  NoPoiseSource = "NoPoiseSource",
  // An action targets within the strike zone for the normal attack, charged attack and plunges, and the skill zone for
  // The rest
  Targeting = "Targeting",
  // A hold no source measures must be held half a second
  UnmeasuredHold = "UnmeasuredHold",
}

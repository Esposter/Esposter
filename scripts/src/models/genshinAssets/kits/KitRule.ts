// A builder rule that gives a value of a kit's record no source reads
export enum KitRule {
  // A hit's blunt flag, read off the wiki's Blunt Attacks for its action, its wielder's weapon and its element, with
  // The table's exceptions for the abilities that differ from those rules
  Blunt = "Blunt",
  // A value a character borrows from the donor its overlay names, read from the donor's own record in the same build
  BorrowedFromDonor = "BorrowedFromDonor",
  // A plunge's collision strikes as the plunge falls, so its hit lands as the fall starts
  CollisionHitmark = "CollisionHitmark",
  // A burst's first hit deals the character's element, which is its energy's, as the table gives the character
  EnergyElement = "EnergyElement",
  // A talent whose hits its module spawns as a named list has no hits of its own, whatever gcsim's list gives
  NamedHitList = "NamedHitList",
  // A plunge gcsim has no file for strikes once as it lands and ends 24 frames on, and a claymore's charged attack it
  // Has no file for spins at 30 frames, deals its final blow at 60 and ends at 72
  NoActionFile = "NoActionFile",
  // A skill no source gives a hold has none
  NoHold = "NoHold",
  // A hit that is not blunt and deals its character's own Geo names it, so a wielder's Geo does not blunt it
  NonBluntGeoElement = "NonBluntGeoElement",
  // A hit no source gives poise for deals none
  NoPoiseSource = "NoPoiseSource",
  // An action targets within the strike zone for the normal attack, charged attack and plunges, and the skill zone for
  // The rest
  Targeting = "Targeting",
  // A hold no source measures must be held half a second
  UnmeasuredHold = "UnmeasuredHold",
}

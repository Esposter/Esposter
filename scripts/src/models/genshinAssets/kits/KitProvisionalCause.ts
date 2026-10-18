// Why a value of a kit's record is not yet read from a source. `BoxAsCircle`, `NamedHitList`, `NoActionFile`,
// `NoPoiseSource`, `TargetCentred` and `UnmeasuredHold` are the index's shared causes, which the builder applies by rule,
// So a kit's overlay names only the ones that are its own
export enum KitProvisionalCause {
  // A character gcsim has no folder for borrows its donors' frames, hits and areas, which its module names, until a source
  // Gives its own
  BorrowedFromDonor = "BorrowedFromDonor",
  // A box is priced as the circle to its farthest corner, until an area holds a box
  BoxAsCircle = "BoxAsCircle",
  // A source gives another value, and the kit keeps its own until a commit settles it
  DiffersFromSource = "DiffersFromSource",
  // A talent whose hits its module spawns as a named list keeps its own hits list empty
  NamedHitList = "NamedHitList",
  // A plunge gcsim has no file for borrows Bennett's plunge frames, hits and areas, and a claymore's charged
  // Attack it has no file for the frames the kits share
  NoActionFile = "NoActionFile",
  // A hit neither gcsim nor the wiki gives poise for deals none
  NoPoiseSource = "NoPoiseSource",
  // The value agrees with gcsim's current branch but not the tag the builder reads, so it was read past the licence
  // Line
  ReadPastLicence = "ReadPastLicence",
  // A hit gcsim centres on its target reaches the circle round the body to the targeting zone's edge, and an arrow's box
  // On its target the circle round the body as long as the box, until an area holds a target
  TargetCentred = "TargetCentred",
  // No source gives the value, and no cause is known yet
  Unclassified = "Unclassified",
  // A hold's threshold with no table or wiki figure is half a second, Bennett's first Charge Level's
  UnmeasuredHold = "UnmeasuredHold",
  // A value the published record holds that no source gives and no module comment explains; the published value
  // Stands
  Unsourced = "Unsourced",
}

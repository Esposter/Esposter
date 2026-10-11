// Why a value of a kit's record is not yet read from a source. `BoxAsCircle`, `NoActionFile`, `NoPoiseSource`,
// `TargetCentred` and `UnmeasuredHold` are the index's shared causes, which the builder applies by rule, so a kit's
// Overlay names only the ones that are its own
export enum KitProvisionalCause {
  // A box is priced as the circle to its farthest corner, until an area holds a box
  BoxAsCircle = "BoxAsCircle",
  // A source gives another value, and the kit keeps its own until a commit settles it
  DiffersFromSource = "DiffersFromSource",
  // A plunge gcsim has no file for borrows Bennett's areas and the kits' standard frames, and a claymore's charged
  // Attack it has no file for the frames the kits share
  NoActionFile = "NoActionFile",
  // A hit neither gcsim nor the wiki gives poise for deals none
  NoPoiseSource = "NoPoiseSource",
  // The value agrees with gcsim's current branch but not the tag the builder reads, so it was read past the licence
  // Line
  ReadPastLicence = "ReadPastLicence",
  // A hit gcsim centres on its target reaches the circle round the body to the targeting zone's edge, until an area
  // Holds a target
  TargetCentred = "TargetCentred",
  // No source gives the value, and no cause is known yet
  Unclassified = "Unclassified",
  // A hold's threshold with no table or wiki figure is half a second, Bennett's first Charge Level's
  UnmeasuredHold = "UnmeasuredHold",
}

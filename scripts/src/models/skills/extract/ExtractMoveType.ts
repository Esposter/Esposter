export enum ExtractMoveType {
  // One top-level list item and its indented continuation, ending at the next item, a blank line or a heading
  Bullet = "bullet",
  // A heading and everything under it, ending at the next heading of the same or a higher level
  Section = "section",
}

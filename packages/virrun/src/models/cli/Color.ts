// An ANSI style virrun paints its stderr banners with. Values are the human style name so a Color reads clearly in a
// Stack trace or config; colorize maps each to its SGR open/close pair.
export enum Color {
  Blue = "blue",
  Bold = "bold",
  Cyan = "cyan",
  Dim = "dim",
  Green = "green",
  Red = "red",
  Yellow = "yellow",
}

// A row of arches carrying a deck, as an aqueduct or a bridge's arcade is, in metres
export interface ArcadeOptions {
  // The railing along the deck: its height, how far apart its posts stand and how thick they and its rail are
  // (none when absent)
  balustrade?: { height: number; postSpacing: number; thickness: number };
  bayCount: number;
  // The span of one bay, from one pier's middle to the next's
  bayWidth: number;
  // How thick the arcade is, across its row
  depth: number;
  // From the arcade's foot to its deck's top
  height: number;
  // Each pier's width along the row
  pierWidth: number;
  // The solid wall over each arch's crown, up to the deck's top
  spandrelHeight: number;
}

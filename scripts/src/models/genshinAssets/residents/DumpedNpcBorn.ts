// One NPC placed in the open world as the scene's birth records give it: the id of the NPC it is, the place it is set
// Down at in the game's axes, and its turn about the vertical in degrees, which a record without one leaves unset
export interface DumpedNpcBorn {
  _configId: number;
  _id: number;
  _pos: { x: number; y: number; z: number };
  _rot?: { y?: number };
}

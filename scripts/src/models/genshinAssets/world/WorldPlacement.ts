// One object the open world's streaming lays out, as its record holds it, in the game's own left-handed axes: the
// Prefab it draws by the world's id for it and, where the record carries it, the 64-bit hash of the prefab's path (the
// Asset index's PathHashPre in its low byte and PathHashLast in the four above, "" where absent), the radius it is
// Streamed by, its position, its rotation as Euler degrees and its scale
export interface WorldPlacement {
  pathHash: string;
  position: [number, number, number];
  prefabId: number;
  radius: number;
  rotation: [number, number, number];
  scale: [number, number, number];
}

// One number for a chunk's position, so looking a chunk up allocates nothing. Distinct while a chunk's z is within half
// Of 2^20 chunks of the room, sixteen million voxels further than anyone walks
const CHUNK_KEY_SPAN = 2 ** 20;

export const getChunkKey = (chunkX: number, chunkZ: number) => chunkX * CHUNK_KEY_SPAN + chunkZ;

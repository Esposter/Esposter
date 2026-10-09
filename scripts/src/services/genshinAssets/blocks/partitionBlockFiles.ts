import type { BlockFile } from "#src/models/genshinAssets/shared/BlockFile";

// The block files cut into `shardCount` runs of consecutive files: each file goes to the run its starting byte falls in
// Of the total, so every run holds about the same bytes, and the runs keep the order given, merged in turn. A run with no
// File is dropped, which a few files over a shard count does
export const partitionBlockFiles = (files: BlockFile[], shardCount: number): BlockFile[][] => {
  const total = files.reduce((sum, { size }) => sum + size, 0);
  const shards: BlockFile[][] = Array.from({ length: shardCount }, () => []);
  let before = 0;
  for (const [index, file] of files.entries()) {
    const position = total > 0 ? before / total : index / files.length;
    shards[Math.min(shardCount - 1, Math.floor(position * shardCount))]?.push(file);
    before += file.size;
  }
  return shards.filter((shard) => shard.length > 0);
};

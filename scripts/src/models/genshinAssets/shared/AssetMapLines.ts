// One shard's asset map as lines, which are read from its file, and the blocks folder its sources are relative to
export interface AssetMapLines {
  lines: AsyncIterable<string>;
  root: string;
}

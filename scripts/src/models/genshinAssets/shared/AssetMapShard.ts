// One shard's asset map as it is written to disk, and the blocks folder its sources are read relative to
export interface AssetMapShard {
  path: string;
  root: string;
}

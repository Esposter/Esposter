export interface CacheListing {
  isRepoStorePresent: boolean;
  prepareKeys: readonly string[];
  preparePath: string;
  repoStorePath: string;
  snapshotHashes: readonly string[];
  snapshotsPath: string;
  taskBytes: number;
  taskCount: number;
  tasksPath: string;
}

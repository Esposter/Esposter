export interface FsProviderOptions {
  // When true, only virtual paths are intercepted; every other path falls through to real disk.
  overlay: boolean;
}

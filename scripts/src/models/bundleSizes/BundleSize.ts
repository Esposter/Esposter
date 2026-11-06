// One built file of a workspace package: the package it ships in, its path under `dist`, and its size in bytes
export interface BundleSize {
  bytes: number;
  file: string;
  packageName: string;
}

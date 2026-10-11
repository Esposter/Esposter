// What installing a package adds on disk: its own bytes and those of every package it reaches, each counted once, and
// Whether any of those packages is reached by another catalog package as well
export interface InstallCost {
  bytes: number;
  isShared: boolean;
}

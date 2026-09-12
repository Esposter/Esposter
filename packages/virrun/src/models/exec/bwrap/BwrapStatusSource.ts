// Where a bwrap child's exit status is read from: the linux backend's status fd, or the block the wsl backend
// Appends to stderr because no fd crosses the wsl.exe boundary
export enum BwrapStatusSource {
  Fd = "fd",
  Stderr = "stderr",
}

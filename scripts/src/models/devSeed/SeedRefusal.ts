// Why the seed stops before its first write. Each names the target it was aimed at, so the refusal reads as the gate
// That fired rather than as a failed write
export enum SeedRefusal {
  DevDatabase = "DevDatabase",
  DevelopmentStorage = "DevelopmentStorage",
  NonLocalStorage = "NonLocalStorage",
}

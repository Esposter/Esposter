// The two switches `pnpm ai:setup` takes: whether a missing install and a missing parity restore are run, and whether the
// hosted game data is checked
export interface SetupOptions {
  install: boolean;
  verify: boolean;
}

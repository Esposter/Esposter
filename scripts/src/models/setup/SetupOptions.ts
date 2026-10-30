// The two switches `pnpm ai:setup` takes.
// One decides whether a missing install and a missing parity restore are run.
// The other decides whether the hosted game data is checked
export interface SetupOptions {
  install: boolean;
  verify: boolean;
}

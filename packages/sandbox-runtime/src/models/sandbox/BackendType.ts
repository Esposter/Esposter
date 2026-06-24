export enum BackendType {
  // Pick the best backend the host supports. Resolves to Native today: Vfs is faster on `node -e` but
  // Runs code in the host process with no isolation, so it stays opt-in until an isolating backend lands.
  Auto = "auto",
  // Run the command directly on the host with no virtualization.
  Native = "native",
  // Run recognised pure-JS node invocations in the current process — no spawn, no disk — and fall back
  // To Native for anything it can't run in-process, so the result always matches baseline. Opt-in: it
  // Trades isolation for speed, so Auto does not select it yet.
  Vfs = "vfs",
}

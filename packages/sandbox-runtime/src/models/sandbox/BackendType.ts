export enum BackendType {
  // Pick the best backend the host supports. Resolves to Native today: Vfs is faster on `node -e` but
  // Runs code in the host process with no isolation, so it stays opt-in until an isolating backend lands.
  Auto = "auto",
  // Run the command directly on the host with no virtualization.
  Native = "native",
  // Run every command (incl. native binaries) inside a bubblewrap RAM-overlay: reads fall through to
  // The source, writes land in an invisible tmpfs upper, so the host disk is never touched. Linux-only,
  // Opt-in. Unlike Vfs it never falls back to Native — isolation is the product, so an un-isolated run
  // Would be a wrong answer disguised as success; an unsupported host throws instead. Auto does not
  // Select it yet (not gate-proven; non-Linux can't run it).
  Os = "os",
  // Run recognised pure-JS node invocations in the current process — no spawn, no disk — and fall back
  // To Native for anything it can't run in-process, so the result always matches baseline. Opt-in: it
  // Trades isolation for speed, so Auto does not select it yet.
  Vfs = "vfs",
}

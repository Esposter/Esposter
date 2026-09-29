// A hook is never blocked by its own decoration: whatever throws anywhere in the script, the process exits zero
// With nothing on stdout. Registered before anything that can fail, at the process boundary, which is the one
// Place a failure of unknown origin can still be caught whole. The failure is written to stderr first, which the
// Tool keeps in its own debug output on a zero exit and never shows, so it leaves a record without blocking or
// Interrupting anything. The write is asynchronous on Windows, so the exit waits for it; a write that fails throws
// Back into the same handler, which exits at once rather than writing again
let isExiting = false;

const exitQuietly = (reason: unknown) => {
  if (isExiting) process.exit(0);

  isExiting = true;
  process.stderr.write(`${String(reason)}\n`, () => {
    process.exit(0);
  });
};

export const registerQuietExit = (): void => {
  process.on("uncaughtException", exitQuietly);
  process.on("unhandledRejection", exitQuietly);
};

// A hook is never blocked by its own decoration: whatever throws anywhere in the script, the process exits zero
// With nothing printed. Registered before anything that can fail, at the process boundary, which is the one place
// A failure of unknown origin can still be caught whole
const exitQuietly = () => process.exit(0);

export const registerQuietExit = (): void => {
  process.on("uncaughtException", exitQuietly);
  process.on("unhandledRejection", exitQuietly);
};

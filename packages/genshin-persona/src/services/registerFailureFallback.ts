// A session start is never blocked by its own decoration: whatever throws anywhere in the script, the process
// Prints its fallback and exits zero. Registered before anything that can fail, at the process boundary, which is
// The one place a failure of unknown origin can still be caught whole
export const registerFailureFallback = (onFailure: () => void): void => {
  const handleFailure = () => {
    onFailure();
    process.exit(0);
  };
  process.on("uncaughtException", handleFailure);
  process.on("unhandledRejection", handleFailure);
};

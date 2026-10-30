// Runs `work` and returns the warning and error the console logs while it runs, each as the message it logged. The console
// Still prints each one. A fixture whose props drifted from its component logs one as it mounts (a required prop missing,
// or an extraneous or wrongly typed one), and the render still captures, so a visual case records the warning and fails
// rather than holding an image of the wrong screen
export const recordConsoleWarnings = async (work: () => Promise<void>): Promise<string[]> => {
  const { error, warn } = console;
  const messages: string[] = [];
  const record =
    (log: (...data: unknown[]) => void) =>
    (...data: unknown[]) => {
      messages.push(String(data[0]));
      log(...data);
    };
  console.error = record(error);
  console.warn = record(warn);
  try {
    await work();
  } finally {
    console.error = error;
    console.warn = warn;
  }
  return messages;
};

import { getResultAsync } from "@esposter/shared";

// Reads one piece of the Spiral Abyss's game data once, and names a failed read in the console
export const readAbyssData = <T>(read: () => Promise<T>, onRead: (value: T) => void): void => {
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(read).match(onRead, (error) => {
    console.error(error);
  });
};

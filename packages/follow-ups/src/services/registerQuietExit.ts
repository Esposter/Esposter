import { exitQuietly } from "#src/services/exitQuietly";

export const registerQuietExit = (): void => {
  process.on("uncaughtException", (error) => {
    exitQuietly(error);
  });
  process.on("unhandledRejection", (reason) => {
    exitQuietly(reason);
  });
};

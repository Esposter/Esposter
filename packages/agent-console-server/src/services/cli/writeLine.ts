// A line to the host's window, which every command and every driver writes through
export const writeLine = (line: string): void => {
  process.stdout.write(`${line}\n`);
};

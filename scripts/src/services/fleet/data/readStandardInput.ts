// The lines piped into this process, or none when it runs from a terminal
export const readStandardInput = async (): Promise<string[]> => {
  if (process.stdin.isTTY) return [];
  const text = Buffer.concat(await process.stdin.toArray()).toString("utf8");
  return text.split(/\r?\n/).filter((line) => line !== "");
};

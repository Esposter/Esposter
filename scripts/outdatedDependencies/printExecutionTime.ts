export const printExecutionTime = (startedAt: number): void => {
  const elapsedSeconds = ((performance.now() - startedAt) / 1000).toFixed(1);
  console.log(`Done in ${elapsedSeconds}s`);
};

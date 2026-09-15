export const printExecutionTime = (startedAt: number): void => {
  const elapsedSeconds = Temporal.Duration.from({ milliseconds: Math.round(performance.now() - startedAt) }).total(
    "seconds",
  );
  console.log(`Done in ${elapsedSeconds.toFixed(1)}s`);
};

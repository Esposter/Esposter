// The promise a started source resolves when it has ended, which the login's context waits on before it closes
export const getSourceEnded = (source: AudioBufferSourceNode): Promise<void> =>
  new Promise<void>((resolve) => {
    source.addEventListener(
      "ended",
      () => {
        resolve();
      },
      { once: true },
    );
  });

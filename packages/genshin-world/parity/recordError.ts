export const recordError = (error: unknown): void => {
  window.document.body.dataset.parityError = error instanceof Error ? error.message : String(error);
};

// A resource deleted or binned leaves its id behind in every consumer's content, and the Recycle bin is where a
// Restore brings the binding back unchanged
export const getMissingResourceMessage = (name: string) =>
  `This ${name} can't be found. It may have been deleted — pick another, or restore it from the Recycle bin.`;

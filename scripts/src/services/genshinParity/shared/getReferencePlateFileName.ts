// The committed file a reference's plate is held as: the screenshot its clean plate's pixels come from, named by its id
export const getReferencePlateFileName = (referenceId: string): string => `${referenceId}.plate.webp`;

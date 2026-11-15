// The tar mode a transfer runs: create writes an archive of the listed files to stdout, extract reads one from stdin
export const TarOperation = { Create: "-c", Extract: "-x" } as const;
export type TarOperation = (typeof TarOperation)[keyof typeof TarOperation];

// How a PMX file's text is encoded, by the byte its header's globals store it as
export const PmxTextEncoding = { Utf16LittleEndian: 0, Utf8: 1 } as const;
export type PmxTextEncoding = (typeof PmxTextEncoding)[keyof typeof PmxTextEncoding];

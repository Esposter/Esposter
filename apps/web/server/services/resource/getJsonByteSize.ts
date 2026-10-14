// The UTF-8 bytes of a value's JSON encoding, or none for an undefined value, which JSON leaves out entirely
export const getJsonByteSize = (value: unknown) => (value === undefined ? 0 : Buffer.byteLength(JSON.stringify(value)));

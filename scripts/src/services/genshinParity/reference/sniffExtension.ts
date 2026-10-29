import { FILE_SIGNATURES } from "#src/services/genshinParity/reference/constants";

// The extension a file's leading bytes name it as, read from its magic numbers and never from its file name. Anything no
// signature names is `bin`
export const sniffExtension = (head: Buffer): string =>
  FILE_SIGNATURES.find(({ hex, offset }) => head.subarray(offset, offset + hex.length / 2).toString("hex") === hex)
    ?.extension ?? "bin";

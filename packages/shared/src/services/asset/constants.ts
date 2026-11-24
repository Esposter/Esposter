// The class and length of an asset's address, written once here, so every regex that matches an address derives
// From it. an address is the lowercase hex SHA-256 of the bytes it names: 64 characters, each a digit or a lowercase a
// To f
export const ASSET_HASH_SOURCE: string = String.raw`[\da-f]{64}`;
// An address on its own: the last segment of an uploaded file's blob name, or a digest a download is checked against
/* oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex
   would otherwise infer */
export const ASSET_HASH_REGEX: RegExp = new RegExp(String.raw`^${ASSET_HASH_SOURCE}$`, "u");

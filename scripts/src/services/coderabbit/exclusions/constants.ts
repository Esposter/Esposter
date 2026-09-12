// `R` carries the old and new paths; `M` reuses the one path. `A`/`D` are content decisions, never mechanical
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const RENAME_OR_MODIFY_ROW_REGEX: RegExp = /^(?<status>R\d*|M)\t(?<oldPath>[^\t]+)(?:\t(?<newPath>[^\t]+))?$/u;

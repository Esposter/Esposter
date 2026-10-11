// Which module format a package ships, read from its manifest: a CommonJS package is the one the tsdown ESM build gains from
export enum PackageFormat {
  Commonjs = "commonjs",
  Dual = "dual",
  Esm = "esm",
  Types = "types",
}

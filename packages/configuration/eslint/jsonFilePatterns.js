// The one place the JSON glob is written. Three configs have to agree on it: the one that lints JSON, and the
// Two JS-side configs that would otherwise reach it — `nuxt/javascript` and perfectionist both match every file,
// And a script rule walking a JSON AST reports nonsense. A second copy of the glob is how one of the three ends
// Up covering a file the others do not.
export default ["**/*.json"];

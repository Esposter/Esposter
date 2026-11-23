// The selector ban lists are ESLint's JavaScript until they move to oxlint, so the template pass reads them through this
declare module "@esposter/configuration/eslint/restricted*Syntaxes.js" {
  const syntaxes: { message: string; selector: string }[];
  export default syntaxes;
}

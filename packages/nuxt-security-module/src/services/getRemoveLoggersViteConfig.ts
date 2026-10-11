// The Vite build options that drop every `console.*` call. Rolldown's compressor removes them on the AST,
// The option is the one the bundler documents, so no regex touches code that merely contains the text
export const getRemoveLoggersViteConfig = () => ({
  build: { rolldownOptions: { output: { minify: { compress: { dropConsole: true } } } } },
});

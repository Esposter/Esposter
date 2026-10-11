// The Vite build options that drop every `console.*` call. Rolldown's compressor removes them on the AST,
// so no regex touches code that merely contains the text, and the option is the one the bundler documents
export const getRemoveLoggersViteConfig = () => ({
  build: { rolldownOptions: { output: { minify: { compress: { dropConsole: true } } } } },
});

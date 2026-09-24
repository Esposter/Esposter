export interface FlowMapSourceContext {
  // Composables by export name, since Nuxt auto-imports them and a caller names no file
  autoImportPathMap: Map<string, string>;
  // Components by their Nuxt name, lowered and without dashes
  componentPathMap: Map<string, string>;
  layoutPathMap: Map<string, string>;
  middlewarePathMap: Map<string, string>;
}

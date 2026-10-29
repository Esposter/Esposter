export interface RenderContext {
  // The origin a link to another resource is made absolute against, since a published page and an email are read
  // Away from the app
  baseUrl: string;
}

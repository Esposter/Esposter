export interface BasicAuthOptions {
  // Requests whose path starts with one of these are challenged, unless `exclude` also matches them
  exclude?: string[] | undefined;
  include?: string[] | undefined;
  message?: string | undefined;
  name: string;
  pass: string;
}

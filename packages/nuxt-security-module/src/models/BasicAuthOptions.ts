export interface BasicAuthOptions {
  // Requests whose path starts with one of these are challenged, unless `exclude` also matches them
  exclude?: string[];
  include?: string[];
  message?: string;
  name: string;
  pass: string;
}

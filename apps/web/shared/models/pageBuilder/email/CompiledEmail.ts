// An email's HTML as MJML compiled it, with the validation messages it rendered despite
export interface CompiledEmail {
  errors: string[];
  html: string;
}

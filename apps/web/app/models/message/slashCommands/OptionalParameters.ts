export type OptionalParameters<Parameters> = {
  [P in Extract<Parameters, { isRequired: false; name: string }> as P["name"]]?: string;
};

export type RequiredParameters<Parameters> = {
  [P in Extract<Parameters, { isRequired: true; name: string }> as P["name"]]: string;
};

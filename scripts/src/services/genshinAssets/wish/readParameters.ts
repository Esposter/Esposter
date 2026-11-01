// Every value the template writes for each `name = value` parameter, in the order the page writes them, trimmed
export const readParameters = (template: string): Map<string, string[]> => {
  const parameters = new Map<string, string[]>();
  for (const parameter of template.split("\n|").slice(1)) {
    const separator = parameter.indexOf("=");
    if (separator === -1) continue;

    const name = parameter.slice(0, separator).trim();
    parameters.set(name, [...(parameters.get(name) ?? []), parameter.slice(separator + 1).trim()]);
  }
  return parameters;
};

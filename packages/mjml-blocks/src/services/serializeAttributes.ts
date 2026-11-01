// Each attribute as MJML source writes it, its value as given: the render escaped it already
export const serializeAttributes = (attributes: Record<string, boolean | string>): string =>
  Object.entries(attributes)
    .map(([name, value]) => ` ${name}="${String(value)}"`)
    .join("");

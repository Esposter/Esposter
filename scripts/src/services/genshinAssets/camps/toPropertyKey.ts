// A label as a property key, bare when it is an identifier and quoted otherwise
export const toPropertyKey = (label: string): string =>
  /^[A-Za-z_$][\w$]*$/u.test(label) ? label : JSON.stringify(label);

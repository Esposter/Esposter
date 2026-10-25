// A name selects the fit it is, and every fit under it as a group, so `ground` selects each `ground/<area>`
export const checkIsSelectedBy = (name: string, selected: string): boolean =>
  name === selected || name.startsWith(`${selected}/`);

// Each list is shown highest position first, as the server orders its roles
export const comparePositionDescending = (firstRole: { position: number }, secondRole: { position: number }) =>
  secondRole.position - firstRole.position;

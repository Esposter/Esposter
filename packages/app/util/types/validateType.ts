export const validateType =
  <T>() =>
  <U extends T>(u: U) =>
    u;

export type SetLights = (shares: { ambientShare?: number; sunShare?: number }) => {
  direction: [number, number, number];
};

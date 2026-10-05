// The port a socket address reaches, its scheme's default when the address names none
export const getPort = (address: string): number => {
  const { port, protocol } = new URL(address);
  if (port) return Number(port);
  else return protocol === "wss:" ? 443 : 80;
};

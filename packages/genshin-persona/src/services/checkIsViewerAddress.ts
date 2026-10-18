// A viewer's socket is a WebSocket address, so anything else is refused before it is written down as the viewer
export const checkIsViewerAddress = (address: string): boolean => {
  const url = URL.parse(address);
  return url !== null && (url.protocol === "ws:" || url.protocol === "wss:");
};

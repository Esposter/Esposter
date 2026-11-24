// A socket the runtime accepted, as the object and the registry see it: the object sends and closes it, and the socket
// Reports its close, so the registry drops it
export interface MockObjectSocket {
  close: (code: number, reason: string) => void;
  onClose: (listener: () => void) => void;
  send: (frame: string) => void;
}

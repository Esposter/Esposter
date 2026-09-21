import { openVoiceSocket } from "#src/services/openVoiceSocket";

// Whether something answers at the address: a socket file a server was killed without removing is bound to
// Nothing, and is removed before a new server binds it
export const checkIsVoiceServerRunning = async (): Promise<boolean> => {
  const socket = await openVoiceSocket();
  socket?.destroy();
  return Boolean(socket);
};

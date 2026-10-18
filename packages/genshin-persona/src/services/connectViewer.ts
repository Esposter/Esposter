import type { ViewerLink } from "#src/models/ViewerLink";

import { ViewerEvent } from "#src/models/ViewerEvent";
import { ViewerMessage } from "#src/models/ViewerMessage";
import {
  VIEWER_CONNECT_TIMEOUT_MS,
  VIEWER_MESSAGE_ID_START,
  VIEWER_OPEN_READY_STATE,
  VIEWER_SOUND_CHANNEL,
  VIEWER_SOUND_VOLUME,
} from "#src/services/constants";
import { parseJsonObject } from "#src/services/parseJsonObject";

// The socket as this client uses it, so a test drives one without a viewer behind it
export type ViewerSocket = Pick<WebSocket, "addEventListener" | "close" | "readyState" | "send">;
export type ViewerSocketFactory = (address: string) => ViewerSocket;

const createViewerSocket: ViewerSocketFactory = (address) => new WebSocket(address);

// The viewer's messages are `{ msg, msgId, data }`, and the reply to a message carries the same `msgId`. A message is
// Sent without waiting for its answer, since a bubble answers when it is received and a sound never does; only the
// Registration is waited on, because the taps are not delivered to a client that is not yet registered. Resolves with
// The socket open and its taps wired, or nothing once the viewer does not answer within the budget
export const connectViewer = async (
  address: string,
  createSocket: ViewerSocketFactory = createViewerSocket,
): Promise<ViewerLink | undefined> => {
  const socket = createSocket(address);
  const isOpened = await waitForOpen(socket);
  if (!isOpened) {
    socket.close();
    return undefined;
  }

  let messageId = VIEWER_MESSAGE_ID_START;
  const pendingReplies = new Map<number, () => void>();
  const tapListeners: (() => void)[] = [];
  socket.addEventListener("message", (event) => {
    // A frame that is not an object is not a message of the viewer's, and a listener that throws ends the synthesizer
    const text = String(event.data);
    if (!text.startsWith("{")) return;

    const frame = readViewerFrame(text);
    if (!frame) return;

    const { data, msg, msgId } = frame;
    if (msg === ViewerMessage.ModelEvent && isTap(data)) for (const listener of tapListeners) listener();
    if (typeof msgId !== "number") return;

    pendingReplies.get(msgId)?.();
    pendingReplies.delete(msgId);
  });
  // A socket the viewer closed under the reading is one nothing else is waiting on, so its failed send is never heard
  socket.addEventListener("error", () => {});

  const send = (msg: ViewerMessage, data?: unknown): number => {
    const currentMessageId = messageId;
    messageId += 1;
    socket.send(JSON.stringify({ data, msg, msgId: currentMessageId }));
    return currentMessageId;
  };
  const link: ViewerLink = {
    bubble: (modelId, text, durationMs, frameColor, textColor) => {
      send(ViewerMessage.Bubble, {
        choices: [],
        duration: durationMs,
        id: modelId,
        text,
        textColor,
        textFrameColor: frameColor,
      });
    },
    close: () => {
      socket.close();
    },
    expressionClear: (modelId) => {
      send(ViewerMessage.ExpressionClear, modelId);
    },
    isOpen: () => socket.readyState === VIEWER_OPEN_READY_STATE,
    motion: (modelId, motion) => {
      send(ViewerMessage.Motion, { id: modelId, mtn: motion, type: 0 });
    },
    onTap: (listener) => {
      tapListeners.push(listener);
    },
    playSound: (modelId, path) => {
      send(ViewerMessage.Sound, {
        channel: VIEWER_SOUND_CHANNEL,
        delay: 0,
        id: modelId,
        loop: false,
        sound: path,
        type: 0,
        volume: VIEWER_SOUND_VOLUME,
      });
    },
    soundStop: (modelId) => {
      send(ViewerMessage.SoundStop, { channel: VIEWER_SOUND_CHANNEL, id: modelId });
    },
  };
  const isRegistered = await waitForReply(pendingReplies, send(ViewerMessage.Register));
  if (isRegistered) return link;

  socket.close();
  return undefined;
};

// A frame that does not parse is one the viewer did not mean for this client, so it is ignored rather than thrown into
// The listener
const readViewerFrame = (text: string): Record<string, unknown> | undefined => {
  // eslint-disable-next-line no-restricted-syntax -- this package takes no workspace dep, so no getResult; a frame that is not JSON is undefined
  try {
    return parseJsonObject(text);
  } catch {
    return undefined;
  }
};

const isTap = (data: unknown): boolean =>
  typeof data === "object" && data !== null && "type" in data && data.type === ViewerEvent.Tap;

const waitForOpen = (socket: ViewerSocket): Promise<boolean> =>
  new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve(false);
    }, VIEWER_CONNECT_TIMEOUT_MS);
    const settle = (isOpened: boolean) => {
      clearTimeout(timer);
      resolve(isOpened);
    };
    socket.addEventListener("open", () => {
      settle(true);
    });
    socket.addEventListener("error", () => {
      settle(false);
    });
    socket.addEventListener("close", () => {
      settle(false);
    });
  });

const waitForReply = (pendingReplies: Map<number, () => void>, id: number): Promise<boolean> =>
  new Promise((resolve) => {
    const timer = setTimeout(() => {
      pendingReplies.delete(id);
      resolve(false);
    }, VIEWER_CONNECT_TIMEOUT_MS);
    pendingReplies.set(id, () => {
      clearTimeout(timer);
      resolve(true);
    });
  });

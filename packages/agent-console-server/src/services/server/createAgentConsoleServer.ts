import type { Device } from "#src/models/device/Device";
import type { HandshakeMessage } from "#src/models/handshake/HandshakeMessage";
import type { AgentConsoleServer } from "#src/models/server/AgentConsoleServer";
import type { AgentConsoleServerOptions } from "#src/models/server/AgentConsoleServerOptions";
import type { ServerMessage } from "#src/models/server/ServerMessage";
import type { IncomingMessage } from "node:http";
import type { RawData, WebSocket } from "ws";

import { commandSchema } from "#src/models/command/Command";
import { CommandType } from "#src/models/command/CommandType";
import { handshakeMessageSchema } from "#src/models/handshake/HandshakeMessage";
import { HandshakeMessageType } from "#src/models/handshake/HandshakeMessageType";
import { SignaturePurpose } from "#src/models/handshake/SignaturePurpose";
import { HostCloseCode } from "#src/models/server/HostCloseCode";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { SCHEME_PAIRING_CODE_DURATION } from "#src/services/constants";
import { SECRET_BYTE_LENGTH } from "#src/services/device/constants";
import { findDevice } from "#src/services/device/findDevice";
import { getDeviceName } from "#src/services/device/getDeviceName";
import { hashCredential } from "#src/services/device/hashCredential";
import { readDevices } from "#src/services/device/readDevices";
import { writeDevices } from "#src/services/device/writeDevices";
import { checkIsSignatureValid } from "#src/services/handshake/checkIsSignatureValid";
import { getPublicKeyText } from "#src/services/handshake/getPublicKeyText";
import { signNonce } from "#src/services/handshake/signNonce";
import { answerHttpRequest } from "#src/services/server/answerHttpRequest";
import { createEventLog } from "#src/services/server/createEventLog";
import { createPairingCodes } from "#src/services/server/createPairingCodes";
import { handleCommand } from "#src/services/server/handleCommand";
import { sendServerMessage } from "#src/services/server/sendServerMessage";
import { createTaskRegistry } from "#src/services/shared/createTaskRegistry";
import { readMessageText } from "#src/services/shared/readMessageText";
import { exhaustiveGuard, getResult, getResultAsync, noop } from "@esposter/shared";
import { createPublicKey, randomBytes } from "node:crypto";
import { once } from "node:events";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";

// The host: one WebSocket, speaking the contracts both ways to every page that has shown a device credential. It
// Keeps each open session's event log so a page that connects — or reconnects — mid-session is replayed everything
// Before the live stream. A connection's first messages are its handshake: the host signs the challenge it is sent,
// So a page learns it reached this host before it sends its credential, and a page with none pairs with a one-time
// Code from the app's own origin alone
export const createAgentConsoleServer = async ({
  createDriver,
  hostKey,
  hostname,
  origin,
  port,
  stateDirectory,
  writeLine,
}: AgentConsoleServerOptions): Promise<AgentConsoleServer> => {
  const eventLog = createEventLog();
  const taskRegistry = createTaskRegistry();
  const pairingCodes = createPairingCodes();
  const publicKey = createPublicKey(hostKey);
  const publicKeyText = getPublicKeyText(hostKey);
  const webSocketServer = new WebSocketServer({ noServer: true });
  // Each page's socket once its credential is accepted, under its device: only these hear anything of the sessions
  const socketDeviceIdMap = new Map<WebSocket, string>();
  const broadcast = (message: ServerMessage) => {
    for (const webSocket of socketDeviceIdMap.keys()) sendServerMessage(webSocket, message);
  };
  // Many changes land together — a turn ending changes a state and a title — so a refresh asked for while one is
  // Running is folded into one more after it, never a second running beside it and never lost
  let isRefreshing = false;
  let isRefreshStale = false;
  const refreshSessions = () => {
    if (isRefreshing) {
      isRefreshStale = true;
      return;
    }

    isRefreshing = true;
    taskRegistry.run(async () => {
      do {
        isRefreshStale = false;
        // oxlint-disable-next-line no-await-in-loop -- Retry: the refresh repeats only because another was requested while it ran
        await getResultAsync(() => driver.listSessions()).match((sessions) => {
          broadcast({ sessions, type: ServerMessageType.Sessions });
        }, console.error);
      } while (isRefreshStale);
      isRefreshing = false;
    });
  };
  const driver = createDriver({
    onEvents: (sessionId, events) => {
      const newEvents = eventLog.append(sessionId, events);
      if (newEvents.length > 0) broadcast({ events: newEvents, sessionId, type: ServerMessageType.Events });
    },
    onSessionOpen: (sessionId) => {
      eventLog.reset(sessionId);
      broadcast({ sessionId, type: ServerMessageType.SessionReset });
    },
    onSessionsChange: () => {
      refreshSessions();
    },
  });

  // A message that is not a command is answered with why, under no command id — the page cannot have sent it
  const receive = async (webSocket: WebSocket, data: RawData) => {
    const command = getResult(
      // oxlint-disable-next-line no-restricted-properties -- the command schema validates the payload and coerces its dates, the pair /docs/architecture/serialization.md names
      () => commandSchema.parse(JSON.parse(readMessageText(data))),
    )
      .orTee((error) => {
        sendServerMessage(webSocket, { commandId: "", message: error.message, type: ServerMessageType.CommandError });
      })
      .unwrapOr(undefined);
    if (!command) return;

    await getResultAsync(() => handleCommand(driver, command)).match(
      (sessionId) => {
        if (sessionId)
          sendServerMessage(webSocket, { commandId: command.id, sessionId, type: ServerMessageType.SessionOpened });
        else if (command.type === CommandType.ListSessions) refreshSessions();
      },
      (error) => {
        sendServerMessage(webSocket, {
          commandId: command.id,
          message: error.message,
          type: ServerMessageType.CommandError,
        });
      },
    );
  };

  const admit = (webSocket: WebSocket, deviceId: string) => {
    socketDeviceIdMap.set(webSocket, deviceId);
    for (const [sessionId, events] of eventLog.entries())
      sendServerMessage(webSocket, { events, sessionId, type: ServerMessageType.Events });
    refreshSessions();
  };

  const pair = (webSocket: WebSocket, request: IncomingMessage, code: string) => {
    if (request.headers.origin !== origin || !pairingCodes.take(code)) {
      webSocket.close(HostCloseCode.PairingRefused);
      return;
    }

    const credential = randomBytes(SECRET_BYTE_LENGTH).toString("base64url");
    const device: Device = {
      createdAt: new Date(),
      credentialHash: hashCredential(credential),
      id: crypto.randomUUID(),
      name: getDeviceName(request.headers["user-agent"] ?? ""),
      origin,
    };
    writeDevices(stateDirectory, [...readDevices(stateDirectory), device]);
    writeLine(`${device.name} connected. To remove it: devices --revoke ${device.id}`);
    sendServerMessage(webSocket, {
      credential,
      deviceId: device.id,
      publicKey: publicKeyText,
      type: ServerMessageType.Paired,
    });
    admit(webSocket, device.id);
  };

  // A hand-off or a revoke comes from the host's own executable run again, which proves it by signing this
  // Connection's nonce with the same key
  const receiveHandshake = (
    webSocket: WebSocket,
    request: IncomingMessage,
    hostNonce: string,
    handshakeMessage: HandshakeMessage,
  ) => {
    // The port the connection reached, never the `Host` header the caller wrote
    const localPort = request.socket.localPort ?? 0;
    switch (handshakeMessage.type) {
      case HandshakeMessageType.Authenticate: {
        const device = findDevice(readDevices(stateDirectory), handshakeMessage.credential);
        if (!device) {
          webSocket.close(HostCloseCode.CredentialRefused);
          return;
        }

        sendServerMessage(webSocket, { type: ServerMessageType.Authenticated });
        admit(webSocket, device.id);
        return;
      }
      case HandshakeMessageType.Challenge:
        sendServerMessage(webSocket, {
          nonce: hostNonce,
          port: localPort,
          signature: signNonce(hostKey, SignaturePurpose.HostProof, localPort, handshakeMessage.nonce),
          type: ServerMessageType.Proof,
        });
        return;
      case HandshakeMessageType.HandOff:
      case HandshakeMessageType.Revoke:
        if (
          !checkIsSignatureValid(
            publicKey,
            SignaturePurpose.OwnerProof,
            localPort,
            hostNonce,
            handshakeMessage.signature,
          )
        ) {
          webSocket.close(HostCloseCode.SignatureRefused);
          return;
        }

        if (handshakeMessage.type === HandshakeMessageType.HandOff)
          pairingCodes.add(handshakeMessage.code, SCHEME_PAIRING_CODE_DURATION);
        else {
          for (const [deviceWebSocket, deviceId] of socketDeviceIdMap)
            if (deviceId === handshakeMessage.deviceId) deviceWebSocket.close(HostCloseCode.CredentialRefused);
          writeLine("A device was removed, and its connection closed.");
        }
        webSocket.close();
        return;
      case HandshakeMessageType.Pair:
        pair(webSocket, request, handshakeMessage.code);
        return;
      default:
        exhaustiveGuard(handshakeMessage);
    }
  };

  webSocketServer.on("connection", (webSocket: WebSocket, request: IncomingMessage) => {
    const hostNonce = randomBytes(SECRET_BYTE_LENGTH).toString("base64url");
    webSocket.on("message", (data) => {
      if (socketDeviceIdMap.has(webSocket)) {
        taskRegistry.run(() => receive(webSocket, data));
        return;
      }

      getResult(() => {
        receiveHandshake(
          webSocket,
          request,
          hostNonce,
          // oxlint-disable-next-line no-restricted-properties -- the handshake schema validates the payload, the pair /docs/architecture/serialization.md names
          handshakeMessageSchema.parse(JSON.parse(readMessageText(data))),
        );
      }).match(noop, (error) => {
        console.error(error);
        webSocket.close(HostCloseCode.HandshakeRefused);
      });
    });
    webSocket.on("close", () => {
      socketDeviceIdMap.delete(webSocket);
    });
  });

  const httpServer = createServer((request, response) => {
    answerHttpRequest(request, response);
  });
  // A browser sets a socket's origin itself, and one from any site but the app's is refused before its handshake
  httpServer.on("upgrade", (request, socket, head) => {
    if (request.headers.origin !== undefined && request.headers.origin !== origin) {
      socket.end("HTTP/1.1 403 Forbidden\r\n\r\n");
      return;
    }

    webSocketServer.handleUpgrade(request, socket, head, (webSocket) => {
      webSocketServer.emit("connection", webSocket, request);
    });
  });
  httpServer.listen(port, hostname);
  await once(httpServer, "listening");
  const address = httpServer.address();

  // Every close is the host being stopped on purpose, so every page hears so before its sessions end and its socket
  // Goes, and shows the host stopped rather than retrying it. A second close — a window that raises more than one
  // Signal as it goes — waits on the first rather than closing what is already closed
  let closing: Promise<void> | undefined;
  const close = async () => {
    broadcast({ type: ServerMessageType.HostStopping });
    pairingCodes.clear();
    await driver.close();
    for (const webSocket of webSocketServer.clients) webSocket.terminate();
    webSocketServer.close();
    httpServer.close();
    await Promise.all([taskRegistry.drain(), once(webSocketServer, "close"), once(httpServer, "close")]);
  };

  return {
    addPairingCode: pairingCodes.add,
    close: () => (closing ??= close()),
    port: typeof address === "object" && address ? address.port : port,
  };
};

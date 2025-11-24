import type { Server } from "node:http";

import { ExpressPeerServer } from "peer";

export default defineEventHandler((event) => {
  if (global.peerServer) return;

  const server =
    event.node.res.socket && "server" in event.node.res.socket ? (event.node.res.socket.server as Server) : null;
  if (!server) return;

  const expressPeerServer = ExpressPeerServer(server);
  expressPeerServer.on("connection", (client) => {
    console.log(`Client connected: ${client.getId()}`);
  });
  expressPeerServer.on("disconnect", (client) => {
    console.log(`Client disconnected: ${client.getId()}`);
  });

  console.log("Peer Server is listening");
  global.peerServer = expressPeerServer;
});

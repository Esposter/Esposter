import type { KeyObject } from "node:crypto";

import { HOST_KEY_FILENAME } from "#src/services/device/constants";
import { writeStateFile } from "#src/services/device/writeStateFile";
import { createPrivateKey, generateKeyPairSync } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The key the host proves itself with, made once. A page keeps its public half from pairing, so a program answering on
// The port without this file cannot pass for the host
export const readHostKey = (stateDirectory: string): KeyObject => {
  const hostKeyPath = join(stateDirectory, HOST_KEY_FILENAME);
  if (existsSync(hostKeyPath)) return createPrivateKey(readFileSync(hostKeyPath, "utf8"));

  const { privateKey } = generateKeyPairSync("ed25519");
  writeStateFile(stateDirectory, HOST_KEY_FILENAME, privateKey.export({ format: "pem", type: "pkcs8" }));
  return privateKey;
};

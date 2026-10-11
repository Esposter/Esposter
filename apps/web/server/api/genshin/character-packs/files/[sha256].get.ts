import { readSession } from "#server/services/auth/readSession";
import {
  CHARACTER_PACK_FILE_MAX_AGE_SECONDS,
  SHA256_REGEX,
} from "#server/services/genshin/accountCharacterPack/constants";
import { readAccountCharacterPackFile } from "#server/services/genshin/accountCharacterPack/readAccountCharacterPackFile";
import { createError, defineEventHandler, getRouterParams } from "nuxt/server";

// A file of the signed-in player's own packs, by its hash, served to that player alone: the session's cookie is the only
// Credential, and a hash none of the player's packs names is not found, so another account's file is never answered
export default defineEventHandler(async (event) => {
  const getSessionPayload = await readSession(event.req.headers);
  if (!getSessionPayload) throw createError({ status: 401 });
  const { sha256 = "" } = getRouterParams(event);
  if (!SHA256_REGEX.test(sha256)) throw createError({ status: 400 });
  const bytes = await readAccountCharacterPackFile(getSessionPayload.user.id, sha256);
  if (bytes === undefined) throw createError({ status: 404 });
  event.res.headers.set("Cache-Control", `private, max-age=${CHARACTER_PACK_FILE_MAX_AGE_SECONDS}, immutable`);
  event.res.headers.set("Content-Type", "application/octet-stream");
  return bytes;
});

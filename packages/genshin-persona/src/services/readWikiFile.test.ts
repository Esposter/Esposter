import type { ClientRequest, IncomingMessage } from "node:http";
import type { request as baseRequest } from "node:https";

import { WIKI_FILE_MAX_BYTES, WIKI_ORIGIN } from "#src/services/constants";
import { TEST_FILENAME } from "#src/services/constants.test";
import { readWikiFile } from "#src/services/readWikiFile";
import { EventEmitter } from "node:events";
import { Readable } from "node:stream";
import { describe, expect, test, vi } from "vitest";

const { request } = vi.hoisted(() => ({ request: vi.fn<typeof baseRequest>() }));

vi.mock(import("node:https"), () => ({ request: request as unknown as typeof baseRequest }));

describe(readWikiFile, () => {
  test("refuses a body past its ceiling rather than holding it whole", async () => {
    expect.hasAssertions();

    const response = Object.assign(Readable.from([Buffer.alloc(WIKI_FILE_MAX_BYTES + 1)]), {
      complete: true,
      statusCode: 200,
    });
    request.mockImplementationOnce((_url, _options, callback) => {
      callback?.(response as unknown as IncomingMessage);
      return Object.assign(new EventEmitter(), { end: () => undefined }) as unknown as ClientRequest;
    });

    await expect(readWikiFile(`${WIKI_ORIGIN}/${TEST_FILENAME}`)).resolves.toBeUndefined();
  });
});

import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Database } from "node:sqlite";

import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { SIN_NAMES } from "./constants";
import { getSinQuestions } from "./getSinQuestions";
import { SINS_SCRIPT } from "./sinsScript";

// Runs the script as the module runs it, with the payload on stdin and the key in its environment, and reads its result
const runScript = (payload: object, key: string) =>
  new Promise<string>((resolve) => {
    const child = spawn("node", ["--input-type=module", "-e", SINS_SCRIPT], {
      env: { ...process.env, TYPESAFE_API_KEY: key },
    });
    let stdout = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.on("close", () => resolve(stdout));
    child.stdin.end(JSON.stringify(payload));
  });

describe("sinsScript", () => {
  let server: Server;
  let apiUrl = "";
  let status = 200;
  let storePath = "";

  beforeEach(async () => {
    storePath = join(mkdtempSync(join(tmpdir(), "sins-")), "sins.sqlite");
    const answers = Object.fromEntries(SIN_NAMES.map((name) => [name, { confidence: 0.5, score: 2, type: "score" }]));
    server = createServer((_request, response) => {
      response.writeHead(status, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ answers, model: "jev-latest" }));
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    apiUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/v1/systemone`;
  });

  afterEach(async () => {
    status = 200;
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  const getPayload = () => ({ apiUrl, questions: getSinQuestions(), session: 1, state: "a prompt", storePath });

  test("answers no-key without a key, and makes no request", async () => {
    expect.hasAssertions();

    expect(JSON.parse(await runScript(getPayload(), ""))).toStrictEqual({ result: "no-key" });
  });

  test("records one evidence row for the prompt, holding its seven answers", async () => {
    expect.hasAssertions();

    const result = JSON.parse(await runScript(getPayload(), "test-key"));
    expect(result.result).toBe("answered");
    expect(Object.keys(result.answers)).toStrictEqual([...SIN_NAMES]);

    const database = new Database(storePath);
    const rows = database.prepare("SELECT answers FROM evidence").all();
    expect(rows).toHaveLength(1);
    expect(Object.keys(JSON.parse(String(rows[0]?.answers)))).toStrictEqual([...SIN_NAMES]);
    database.close();
  });

  test("writes no evidence when the call fails", async () => {
    expect.hasAssertions();

    status = 500;
    expect(JSON.parse(await runScript(getPayload(), "test-key"))).toStrictEqual({
      reason: "HTTP 500",
      result: "failed",
    });
  });
});

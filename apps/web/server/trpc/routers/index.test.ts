import type { AnyProcedure } from "@trpc/server";

import { OPAQUE_KEY } from "#server/services/mcp/constants";
import { getRequestJsonSchema, readUnboundedPaths } from "#server/services/request/readUnboundedPaths.test";
import { trpcRouter } from "#server/trpc/routers";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("trpcRouter", () => {
  // A request body is parsed whole before a procedure runs, so an input with no ceiling lets any caller hand the
  // Server a string or an array as large as the body limit, and have it validated, stored or queried with
  test("bounds every string and array in every procedure's input", () => {
    expect.hasAssertions();

    const unboundedProcedurePaths = new Set<string>();
    const opaqueProcedurePaths = new Set<string>();
    // The record is flat at runtime, one procedure per dotted path, where its type nests the sub-routers
    const procedures = trpcRouter._def.procedures as unknown as Record<string, AnyProcedure>;

    for (const [procedurePath, procedure] of Object.entries(procedures))
      for (const input of procedure._def.inputs) {
        const jsonSchema = getRequestJsonSchema(input as z.ZodType);
        if (readUnboundedPaths(jsonSchema, procedurePath).length > 0) unboundedProcedurePaths.add(procedurePath);
        if (JSON.stringify(jsonSchema).includes(`"${OPAQUE_KEY}":true`)) opaqueProcedurePaths.add(procedurePath);
      }

    expect([...unboundedProcedurePaths]).toStrictEqual([]);
    // An opaque value holds whatever strings and arrays it is sent, so these are the procedures that carry one: each
    // Carries a document whose shape another library or resource owns (TipTap, SurveyJS answers, a blueprint's entries),
    // Or a patch's values, which the resource's own schema parses once applied. A new one is bounded beside it or named
    expect([...opaqueProcedurePaths]).toStrictEqual([
      "blueprint.saveResourceContent",
      "email.saveResourceContent",
      "email.compile",
      "note.saveResourceContent",
      "resource.updateResourceContent",
      "survey.createSurveyResponse",
      "survey.updateSurveyResponse",
      "webpage.saveResourceContent",
    ]);
  });

  test("an unbounded string beside an opaque document fails the guard", () => {
    expect.hasAssertions();

    const schema = getRequestJsonSchema(z.object({ document: z.unknown(), title: z.string() }));

    expect(readUnboundedPaths(schema, "input")).toStrictEqual(["input.title (string)"]);
  });

  // A format only says what shape a string takes, and a URL or an email has no length of its own
  test("a url, an email and an open pattern fail the guard until they carry a length", () => {
    expect.hasAssertions();

    const schema = getRequestJsonSchema(
      z.object({
        bounded: z.url().max(1),
        email: z.email(),
        fixed: z.uuid(),
        open: z.string().regex(/^a+$/u),
        url: z.url(),
      }),
    );

    expect(readUnboundedPaths(schema, "input")).toStrictEqual([
      "input.email (string)",
      "input.open (string)",
      "input.url (string)",
    ]);
  });
});

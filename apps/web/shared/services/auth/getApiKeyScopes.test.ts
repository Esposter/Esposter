import { McpScope } from "#shared/models/auth/McpScope";
import { getApiKeyScopes } from "#shared/services/auth/getApiKeyScopes";
import { describe, expect, test } from "vitest";

describe(getApiKeyScopes, () => {
  test("reads the scopes a key was given", () => {
    expect.hasAssertions();

    expect(getApiKeyScopes({ mcp: [McpScope.FollowUps] })).toStrictEqual([McpScope.FollowUps]);
  });

  // A key made before scopes existed holds no permissions, and one holding a scope this app never grants was not
  // Made by it, so each reaches nothing rather than whatever its record seems to say
  test.each([
    ["no permissions", null],
    ["no MCP scopes", {}],
    ["an unknown scope", { mcp: [""] }],
    ["a repeated scope", { mcp: [McpScope.FollowUps, McpScope.FollowUps] }],
  ])("denies a key with %s", (_description, permissions) => {
    expect.hasAssertions();

    expect(getApiKeyScopes(permissions)).toStrictEqual([]);
  });
});

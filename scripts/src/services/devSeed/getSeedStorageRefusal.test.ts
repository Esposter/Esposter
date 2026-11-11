import { SeedRefusal } from "#src/models/devSeed/SeedRefusal";
import { DEVELOPMENT_STORAGE_CONNECTION_STRING } from "#src/services/devSeed/constants";
import { getSeedStorageRefusal } from "#src/services/devSeed/getSeedStorageRefusal";
import { describe, expect, test } from "vitest";

describe(getSeedStorageRefusal, () => {
  const DEFAULT_EMULATOR_TABLE_ENDPOINT = "TableEndpoint=http://127.0.0.1:10002";

  test("the default development emulator is refused", () => {
    expect.hasAssertions();
    expect(getSeedStorageRefusal(DEVELOPMENT_STORAGE_CONNECTION_STRING)).toBe(SeedRefusal.DevelopmentStorage);
  });

  // The SDK maps any connection string containing the default emulator's flag to that emulator, whatever
  // Endpoint follows it
  test("a connection string naming the default emulator is refused whatever endpoint follows", () => {
    expect.hasAssertions();
    expect(getSeedStorageRefusal(`${DEVELOPMENT_STORAGE_CONNECTION_STRING};TableEndpoint=http://127.0.0.1:11002`)).toBe(
      SeedRefusal.DevelopmentStorage,
    );
  });

  test("an explicit endpoint on the default emulator's table port is refused", () => {
    expect.hasAssertions();
    expect(getSeedStorageRefusal(DEFAULT_EMULATOR_TABLE_ENDPOINT)).toBe(SeedRefusal.DevelopmentStorage);
  });

  test("a loopback endpoint on another port is not refused", () => {
    expect.hasAssertions();
    expect(getSeedStorageRefusal("TableEndpoint=http://127.0.0.1:11002")).toBeUndefined();
  });

  test("a remote endpoint is refused as non-local storage", () => {
    expect.hasAssertions();
    expect(getSeedStorageRefusal("TableEndpoint=https://remote.example")).toBe(SeedRefusal.NonLocalStorage);
  });

  test("a connection string naming no table endpoint is refused as non-local storage", () => {
    expect.hasAssertions();
    expect(getSeedStorageRefusal("")).toBe(SeedRefusal.NonLocalStorage);
  });
});

import type { Peer } from "#src/models/fleet/data/Peer";

import { TransferDirection } from "#src/models/fleet/data/TransferDirection";
import { getTransferCommands } from "#src/services/fleet/data/getTransferCommands";
import { toRemotePath } from "#src/services/fleet/data/toRemotePath";
import { describe, expect, test } from "vitest";

const PEER: Peer = {
  host: "192.168.0.2",
  identityFile: "/keys/fleet",
  parityDirectory: "~/data",
  repository: "/repo",
  user: "me",
};
const LOCAL_DIRECTORY = "/local";

describe(getTransferCommands, () => {
  test("a pull archives on the peer over ssh and unpacks here", () => {
    expect.hasAssertions();

    const [source, target] = getTransferCommands(TransferDirection.Pull, PEER, LOCAL_DIRECTORY, PEER.parityDirectory);
    expect(source).toStrictEqual({
      args: [
        "-i",
        "/keys/fleet",
        "-o",
        "IdentitiesOnly=yes",
        "-o",
        "BatchMode=yes",
        "me@192.168.0.2",
        `tar -c -f - -C "$HOME"/'data' -T -`,
      ],
      file: "ssh",
    });
    expect(target).toStrictEqual({ args: ["-x", "-f", "-", "-C", LOCAL_DIRECTORY], file: "tar" });
  });

  test("a push archives here and unpacks on the peer over ssh", () => {
    expect.hasAssertions();

    const [source, target] = getTransferCommands(TransferDirection.Push, PEER, LOCAL_DIRECTORY, PEER.parityDirectory);
    expect(source).toStrictEqual({ args: ["-c", "-f", "-", "-C", LOCAL_DIRECTORY, "-T", "-"], file: "tar" });
    expect(target.file).toBe("ssh");
    expect(target.args.at(-1)).toBe(`tar -x -f - -C "$HOME"/'data'`);
  });

  test("leaves out the identity file when the peer names none", () => {
    expect.hasAssertions();

    const [, target] = getTransferCommands(
      TransferDirection.Push,
      { ...PEER, identityFile: "" },
      LOCAL_DIRECTORY,
      PEER.parityDirectory,
    );
    expect(target.args.slice(0, 2)).toStrictEqual(["-o", "BatchMode=yes"]);
  });
});

describe(toRemotePath, () => {
  test("quotes a path and resolves a leading ~/ to the peer's home", () => {
    expect.hasAssertions();

    expect(toRemotePath("~/a b")).toBe(`"$HOME"/'a b'`);
    expect(toRemotePath("/it's")).toBe(`'/it'\\''s'`);
  });
});

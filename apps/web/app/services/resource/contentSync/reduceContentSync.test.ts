import type { ContentSyncEffect } from "#src/models/resource/contentSync/ContentSyncEffect";
import type { ContentSyncEvent } from "#src/models/resource/contentSync/ContentSyncEvent";
import type { ContentSyncState } from "#src/models/resource/contentSync/ContentSyncState";

import { ContentSyncEffectType } from "#src/models/resource/contentSync/ContentSyncEffect";
import { ContentSyncEventType } from "#src/models/resource/contentSync/ContentSyncEvent";
import { ContentSyncKind } from "#src/models/resource/contentSync/ContentSyncKind";
import { reduceContentSync } from "#src/services/resource/contentSync/reduceContentSync";
import { describe, expect, test } from "vitest";

const snapshot = (value: number) => ({ content: value, json: String(value) });
const run = (events: ContentSyncEvent[]) =>
  events.reduce<{ effects: ContentSyncEffect[]; state: ContentSyncState }>(
    ({ state }, event) => reduceContentSync(state, event),
    { effects: [], state: { kind: ContentSyncKind.Unread } },
  );

describe(reduceContentSync, () => {
  const opened: ContentSyncEvent[] = [
    { hash: "0", type: ContentSyncEventType.Read, version: 0 },
    { json: "0", type: ContentSyncEventType.Seeded },
  ];

  test("a late row of a device's own earlier save is not adopted", () => {
    expect.hasAssertions();

    const { effects, state } = run([
      ...opened,
      { snapshot: snapshot(1), type: ContentSyncEventType.SaveRequested },
      { hash: "1", type: ContentSyncEventType.SaveAcknowledged, version: 1 },
      { snapshot: snapshot(2), type: ContentSyncEventType.SaveRequested },
      { hash: "2", type: ContentSyncEventType.SaveAcknowledged, version: 2 },
      { hash: "1", type: ContentSyncEventType.RowArrived, version: 1 },
    ]);

    expect(state).toStrictEqual({ base: { hash: "2", json: "2", version: 2 }, kind: ContentSyncKind.Synced });
    expect(effects).toStrictEqual([]);
  });

  test("an edit made while another device's save is adopted stays on screen", () => {
    expect.hasAssertions();

    const { effects, state } = run([
      ...opened,
      { hash: "other", type: ContentSyncEventType.RowArrived, version: 1 },
      { type: ContentSyncEventType.Edited },
      { hash: "other", type: ContentSyncEventType.Read, version: 1 },
    ]);

    expect(state.kind).toBe(ContentSyncKind.Conflict);
    expect(effects).toStrictEqual([]);
  });

  test("saves asked for during a save send only the latest once it answers", () => {
    expect.hasAssertions();

    const { effects, state } = run([
      ...opened,
      { snapshot: snapshot(1), type: ContentSyncEventType.SaveRequested },
      { snapshot: snapshot(2), type: ContentSyncEventType.SaveRequested },
      { snapshot: snapshot(3), type: ContentSyncEventType.SaveRequested },
      { hash: "1", type: ContentSyncEventType.SaveAcknowledged, version: 1 },
    ]);

    expect(effects).toStrictEqual([{ snapshot: snapshot(3), type: ContentSyncEffectType.Send, version: 1 }]);
    expect(state.kind).toBe(ContentSyncKind.Saving);
  });

  test("a save refused as stale offers the choice once the row names the newer version", () => {
    expect.hasAssertions();

    const { effects, state } = run([
      ...opened,
      { snapshot: snapshot(1), type: ContentSyncEventType.SaveRequested },
      { isStale: true, type: ContentSyncEventType.SaveRejected },
    ]);
    const { state: answered } = reduceContentSync(state, {
      hash: "other",
      type: ContentSyncEventType.RowArrived,
      version: 1,
    });

    expect(effects).toStrictEqual([{ type: ContentSyncEffectType.ReadRow }]);
    expect(answered).toStrictEqual({
      base: { hash: "0", json: "0", version: 0 },
      kind: ContentSyncKind.Conflict,
      remoteVersion: 1,
    });
  });

  test("a newer row naming the content already held moves the version without a read", () => {
    expect.hasAssertions();

    const { effects, state } = run([...opened, { hash: "0", type: ContentSyncEventType.RowArrived, version: 3 }]);

    expect(state).toStrictEqual({ base: { hash: "0", json: "0", version: 3 }, kind: ContentSyncKind.Synced });
    expect(effects).toStrictEqual([]);
  });

  test("a failed save leaves the edit on screen as failed", () => {
    expect.hasAssertions();

    const { effects, state } = run([
      ...opened,
      { snapshot: snapshot(1), type: ContentSyncEventType.SaveRequested },
      { isStale: false, type: ContentSyncEventType.SaveRejected },
    ]);

    expect(state.kind).toBe(ContentSyncKind.Failed);
    expect(effects).toStrictEqual([]);
  });

  test("an edit made after a restore asked during a save is kept as a conflict, not replaced by a read", () => {
    expect.hasAssertions();

    const { effects, state } = run([
      ...opened,
      { snapshot: snapshot(1), type: ContentSyncEventType.SaveRequested },
      { type: ContentSyncEventType.ReloadRequested },
      { type: ContentSyncEventType.Edited },
      { snapshot: snapshot(2), type: ContentSyncEventType.SaveRequested },
      { hash: "1", type: ContentSyncEventType.SaveAcknowledged, version: 1 },
    ]);

    expect(state.kind).toBe(ContentSyncKind.Conflict);
    expect(effects).toStrictEqual([]);
  });
});

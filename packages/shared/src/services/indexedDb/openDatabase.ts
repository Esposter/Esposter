import type { Database } from "#src/models/indexedDb/Database";
import type { DatabaseOpenOptions } from "#src/models/indexedDb/DatabaseOpenOptions";
import type { DatabaseSchema } from "#src/models/indexedDb/DatabaseSchema";

import { getResult } from "#src/services/error/getResult";
import { getRequestError } from "#src/services/indexedDb/getRequestError";
import { wrapDatabase } from "#src/services/indexedDb/wrapDatabase";
import { wrapUpgradeDatabase } from "#src/services/indexedDb/wrapUpgradeDatabase";
import { wrapUpgradeTransaction } from "#src/services/indexedDb/wrapUpgradeTransaction";
import { noop } from "#src/util/function/noop";

// Reads `indexedDB` only when called, so importing this module on the server or in a test without the global is harmless
export const openDatabase = <TSchema extends DatabaseSchema = DatabaseSchema>(
  name: string,
  version: number,
  options: DatabaseOpenOptions<TSchema> = {},
): Promise<Database<TSchema>> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.addEventListener("blocked", (event) => {
      options.blocked?.(event.oldVersion, event.newVersion);
    });
    request.addEventListener("upgradeneeded", (event) => {
      // The open request holds its versionchange transaction for the whole of the upgrade, so it is set here
      const { transaction } = request;
      if (!transaction) return;

      // An upgrade that throws would otherwise leave the version applied with half its stores, so the failure aborts the
      // Transaction and the open request rejects with the abort
      getResult(() =>
        options.upgrade?.(
          wrapUpgradeDatabase<TSchema>(request.result),
          event.oldVersion,
          event.newVersion,
          wrapUpgradeTransaction<TSchema>(transaction),
        ),
      ).match(noop, (error) => {
        console.error(error);
        transaction.abort();
      });
    });
    request.addEventListener("success", () => {
      const database = request.result;
      database.addEventListener("close", () => {
        options.terminated?.();
      });
      database.addEventListener("versionchange", (event) => {
        options.blocking?.(event.oldVersion, event.newVersion);
      });
      resolve(wrapDatabase<TSchema>(database));
    });
    request.addEventListener("error", () => {
      reject(getRequestError(request));
    });
  });

-- The page builder's documents do not read GrapesJS project data, so every Email and Webpage row is put past the recycle
-- bin's retention and the daily purge removes it with its directory, activity and view partitions and ledger entries
UPDATE "resource"."resources" SET "deletedAt" = 'epoch' WHERE "type" IN ('Email', 'Webpage');

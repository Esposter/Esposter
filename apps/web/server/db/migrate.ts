import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// Applies the pending migrations once and exits. It runs as the deploy's pre-deploy command and as the first step of `pnpm dev`,
// so it imports nothing through the app's own aliases, which a plain Node process cannot resolve
const client = postgres(process.env.DATABASE_URL);

await migrate(drizzle({ client }), { migrationsFolder: "server/db/migrations" });
await client.end();

import postgres from "postgres";

// The Railway database, read only: the session itself refuses a write, so no step can change the source by mistake.
// The idle timeout lets the process exit once a step ends, without the step closing its client
export const createSourceClient = (databaseUrl: string) =>
  postgres(databaseUrl, { connection: { default_transaction_read_only: true }, idle_timeout: 1, max: 4 });

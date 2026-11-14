// The shape drizzle-kit writes into migrations.js, declared here because the functions Worker does not compile JavaScript
declare const migrations: { migrations: Record<string, string> };
export default migrations;

// A Durable Object's migration is a SQL file the Worker bundles as text. wrangler's Text rule supplies its contents
declare module "*.sql" {
  const sql: string;
  export default sql;
}

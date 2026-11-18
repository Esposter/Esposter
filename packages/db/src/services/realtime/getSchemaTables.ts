import { schema } from "@esposter/db-schema";
import { is, Table } from "drizzle-orm";

// Every table of the D1 schema, read off its registry so a new table is in the schema the moment it is declared
export const getSchemaTables = (): Table[] => Object.values(schema).filter((value) => is(value, Table));

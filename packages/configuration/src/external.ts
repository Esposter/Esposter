export const external: (RegExp | string)[] = [
  // All workspace packages with @esposter/ prefix — regex covers new packages automatically
  /@esposter\//u,
  // Workspace packages without @esposter/ prefix — must be listed explicitly
  "azure-mock",
  "parse-tmx",
  "vue-phaserjs",
  // @esposter/db — Azure SDKs are peer deps
  "@azure/data-tables",
  "@azure/search-documents",
  "@azure/storage-blob",
  "@azure/web-pubsub",
  // @esposter/infra — Pulumi is a peer dep
  "@pulumi/azure-native",
  "@pulumi/pulumi",
  // @esposter/db-schema
  "zod",
  // @esposter/db-mock
  /^drizzle-kit/u,
  /^drizzle-orm/u,
  "@electric-sql/pglite",
];

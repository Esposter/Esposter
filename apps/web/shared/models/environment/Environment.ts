export enum Environment {
  Development = "development",
  /** @public — a value APP_ENV takes in a deployment, which no code compares against */
  Production = "production",
  /** @public — a value APP_ENV takes under a test run, which no code compares against */
  Test = "test",
}

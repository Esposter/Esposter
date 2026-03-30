declare module "zod" {
  interface GlobalMeta {
    comp?: string;
    getItems?: string;
    getProps?: string;
    uniqueColumnName?: boolean;
  }
}

export {};

export interface CorsHandlerOptions {
  allowHeaders?: string[] | undefined;
  credentials?: boolean | undefined;
  exposeHeaders?: string[] | undefined;
  maxAge?: string | undefined;
  methods: string[];
  origin: string | string[];
  preflight?: undefined | { statusCode: number };
}

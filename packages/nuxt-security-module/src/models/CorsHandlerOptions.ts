export interface CorsHandlerOptions {
  allowHeaders?: string[];
  credentials?: boolean;
  exposeHeaders?: string[];
  maxAge?: string;
  methods: string[];
  origin: string | string[];
  preflight?: { statusCode: number };
}

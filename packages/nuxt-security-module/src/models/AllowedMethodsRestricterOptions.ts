export interface AllowedMethodsRestricterOptions {
  // The methods a request may use.
  // Every other method is answered with `405`
  methods: string[];
}

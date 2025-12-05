export interface MatchHandleContent {
  breadcrumb: {
    label?: string | ((params: unknown) => string);
    ns?: string;
    path?: string;
  };
}

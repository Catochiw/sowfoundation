/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly RESEND_API_KEY?: string;
  readonly CONTACT_TO?: string;
  readonly CONTACT_FROM?: string;
  readonly TURNSTILE_SECRET_KEY?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  turnstile?: {
    reset: (widget?: string | HTMLElement) => void;
    render: (selector: string | HTMLElement, opts: Record<string, unknown>) => string;
  };
}

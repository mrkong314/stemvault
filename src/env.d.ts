/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_EDIT_PIN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

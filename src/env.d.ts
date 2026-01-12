/// <reference types="astro/client" />

interface Runtime {
  env: {
    TURNSTILE_SECRET_KEY?: string;
    EMAIL?: {
      send: (message: EmailMessage) => Promise<void>;
    };
  };
}

declare namespace App {
  interface Locals {
    runtime: Runtime;
  }
}

declare class EmailMessage {
  constructor(from: string, to: string, raw: string);
}

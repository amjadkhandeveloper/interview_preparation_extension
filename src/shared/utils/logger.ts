const SENSITIVE_PATTERNS = [/api[_-]?key/i, /bearer\s+/i, /sk-[a-zA-Z0-9]+/];

export class Logger {
  private namespace: string;

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  info(message: string, ...args: unknown[]): void {
    console.info(`[${this.namespace}]`, message, ...this.sanitize(args));
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`[${this.namespace}]`, message, ...this.sanitize(args));
  }

  error(message: string, ...args: unknown[]): void {
    console.error(`[${this.namespace}]`, message, ...this.sanitize(args));
  }

  private sanitize(args: unknown[]): unknown[] {
    return args.map((arg) => {
      if (typeof arg === 'string') {
        let sanitized = arg;
        for (const pattern of SENSITIVE_PATTERNS) {
          sanitized = sanitized.replace(pattern, '[REDACTED]');
        }
        return sanitized;
      }
      return arg;
    });
  }
}

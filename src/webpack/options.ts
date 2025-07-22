export interface IMakeTypescriptPrivacyBetterOptions {
  enableLogging?: boolean;
  pattern?: RegExp;
  useSymbolTemplate?: boolean;
}

export class MakeTypescriptPrivacyBetterOptions implements IMakeTypescriptPrivacyBetterOptions {
  enableLogging = true;
  pattern = /\.ts$/;
  useSymbolTemplate = true;

  constructor(options: Partial<IMakeTypescriptPrivacyBetterOptions> = {}) {
    Object.assign(this, options);
  }
}

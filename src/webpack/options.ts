// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IMakeTypescriptPrivacyBetterOptions {}

export class MakeTypescriptPrivacyBetterOptions implements IMakeTypescriptPrivacyBetterOptions {
  constructor(options: Partial<IMakeTypescriptPrivacyBetterOptions> = {}) {
    Object.assign(this, options);
  }
}

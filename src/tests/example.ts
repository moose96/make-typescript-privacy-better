class Example {
  private static constant = 'constantValue';

  private static staticMethod(): string {
    return 'staticMethodValue';
  }

  private value: string = '';
  public otherValue: string = '';

  private get someGetter() {
    return this.value;
  }

  private set someSetter(value: string) {
    this.value = value;
  }

  constructor(
    private name: string,
    nonInstance: number,
  ) {}

  public getName(): string {
    return this.name;
  }

  private getValue(): string {
    return this.value;
  }

  public callGetValue(): string {
    return this.getValue();
  }
}

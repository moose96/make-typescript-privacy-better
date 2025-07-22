export class NestedKeyMap<K extends any[], V> extends Map<K, V> {
  delete(key: K): boolean {
    return super.delete(this.createKey(key) as unknown as K);
  }

  get(key: K): V | undefined {
    return super.get(this.createKey(key) as unknown as K);
  }

  has(key: K): boolean {
    return super.has(this.createKey(key) as unknown as K);
  }

  set(key: K, value: V): this {
    return super.set(this.createKey(key) as unknown as K, value);
  }

  concat(other: NestedKeyMap<K, V>): NestedKeyMap<K, V> {
    for (const [key, value] of other) {
      super.set(key, value);
    }
    return this;
  }

  private createKey(key: K): string {
    return key.map((item) => String(item)).join('.');
  }
}

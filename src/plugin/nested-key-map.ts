export class NestedKeyMap<K extends any[], V> extends Map<string | K, V> {
  constructor(entries?: readonly (readonly [K, V])[] | null) {
    super();

    if (entries) {
      for (const [key, value] of entries) {
        this.set(key, value);
      }
    }
  }

  delete(key: K): boolean {
    return super.delete(NestedKeyMap.createKey(key));
  }

  get(key: K): V | undefined {
    return super.get(NestedKeyMap.createKey(key));
  }

  has(key: K): boolean {
    return super.has(NestedKeyMap.createKey(key));
  }

  set(key: K, value: V): this {
    return super.set(NestedKeyMap.createKey(key), value);
  }

  concat(other: NestedKeyMap<K, V>): NestedKeyMap<K, V> {
    for (const [key, value] of other) {
      super.set(key, value);
    }
    return this;
  }

  private static createKey<K extends any[]>(key: K): string {
    return key.map((item) => String(item)).join('.');
  }
}

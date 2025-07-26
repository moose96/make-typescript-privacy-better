import { beforeEach, describe, it, expect } from 'vitest';
import { NestedKeyMap } from '../../plugin/nested-key-map';

describe('NestedKeyMap', () => {
  let map: NestedKeyMap<string[], string>;

  beforeEach(() => {
    map = new NestedKeyMap([[['test', 'property'], 'test']]);
  });

  it('should get an entry', () => {
    const value = map.get(['test', 'property']);
    expect(value).toBe('test');
  });

  it('should not get a non-existing entry', () => {
    const value = map.get(['non', 'existing']);
    expect(value).toBeUndefined();
  });

  it('should check if an entry exists or not', () => {
    expect(map.has(['test', 'property'])).toBe(true);
    expect(map.has(['non', 'existing'])).toBe(false);
  });

  it('should set an entry and return the instance of the nested map', () => {
    expect(map.set(['new', 'property'], 'newValue')).toBeInstanceOf(NestedKeyMap);
    expect(map.get(['new', 'property'])).toBe('newValue');
  });

  it('should delete an entry', () => {
    expect(map.delete(['test', 'property'])).toBe(true);
    expect(map.get(['test', 'property'])).toBeUndefined();
  });

  it('should concatenate with another NestedKeyMap', () => {
    const otherMap = new NestedKeyMap([[['another', 'property'], 'anotherValue']]);
    const concatenatedMap = map.concat(otherMap);

    expect(concatenatedMap.get(['test', 'property'])).toBe('test');
    expect(concatenatedMap.get(['another', 'property'])).toBe('anotherValue');
  });
});

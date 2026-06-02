import FastBooleanArray from "../dist/index.mjs";
import { describe, test, expect } from "vitest";

describe("FastBooleanArray", () => {
  test("constructor should throw if size is not provided", () => {
    expect(() => new FastBooleanArray(0)).toThrow(
      "FastBooleanArray size must be greater than 0",
    );
  });

  test("set and get should work correctly", () => {
    const array = new FastBooleanArray(16);
    array.set(0, true);
    array.set(1, false);
    array.set(2, true);

    expect(array.get(0)).toBe(true);
    expect(array.get(1)).toBe(false);
    expect(array.get(2)).toBe(true);
  });

  test("set and get should REALLY work correctly", () => {
    const array = new FastBooleanArray(200_000);

    // Set values: false for even, true for odd
    for (let i = 0; i < array.size; i++) {
      array.set(i, i % 2 === 1);
    }

    // Verify values
    for (let i = 0; i < array.size; i++) {
      const expected = i % 2 === 1;
      expect(array.get(i)).toBe(expected);
    }
  });

  test("setSafe and getSafe should throw on out-of-bounds access", () => {
    const array = new FastBooleanArray(16);
    expect(() => array.setSafe(16, true)).toThrow("Index out of bounds");
    expect(() => array.getSafe(16)).toThrow("Index out of bounds");
  });

  test("resize should change the size and preserve data", () => {
    const array = new FastBooleanArray(8);
    array.set(0, true);
    array.set(7, true);

    array.resize(16);
    expect(array.get(0)).toBe(true);
    expect(array.get(7)).toBe(true);
    expect(array.get(15)).toBe(false);

    array.resize(4);
    expect(array.get(0)).toBe(true);
    expect(array.get(5)).toBe(false);
    expect(() => array.getSafe(7)).toThrow();
  });

  test("equals should compare arrays correctly", () => {
    const array1 = new FastBooleanArray(8);
    const array2 = new FastBooleanArray(8);

    array1.set(0, true);
    array2.set(0, true);
    expect(array1.equals(array2)).toBe(true);

    array2.set(1, true);
    expect(array1.equals(array2)).toBe(false);
  });

  test("toArray should convert to a standard boolean array", () => {
    const array = new FastBooleanArray(4);
    array.set(0, true);
    array.set(1, false);
    array.set(2, true);
    array.set(3, false);

    expect(array.toArray()).toEqual([true, false, true, false]);
  });

  test("fromString and toString should convert correctly", () => {
    const original = "1010";
    const array = FastBooleanArray.fromString(original);
    expect(array.toString()).toBe(original);
  });

  test("fromArray should initialize correctly", () => {
    const values = [true, false, true, false];
    const array = FastBooleanArray.fromArray(values);
    expect(array.toArray()).toEqual(values);
  });

  test("setAll should set all bits to the specified value", () => {
    const array = new FastBooleanArray(16);
    array.setAll(true);
    expect(array.toArray()).toEqual(new Array(16).fill(true));

    array.setAll(false);
    expect(array.toArray()).toEqual(new Array(16).fill(false));
  });

  test("iterable protocol should work correctly", () => {
    const array = new FastBooleanArray(4);
    array.set(0, true);
    array.set(2, true);
    const result = [...array];
    expect(result).toEqual([true, false, true, false]);
  });

  test("map should create a new array with transformed values", () => {
    const array = new FastBooleanArray(4);
    array.set(0, true);
    array.set(2, true);

    const result = array.map((value) => !value);
    expect(result).toEqual([false, true, false, true]);
  });

  test("reduce should aggregate values", () => {
    const array = new FastBooleanArray(4);
    array.set(0, true);
    array.set(1, true);
    const sum = array.reduce((acc, value) => acc + (value ? 1 : 0), 0);
    expect(sum).toBe(2);
  });

  test("should work in a for loop", () => {
    const array = new FastBooleanArray(4);
    array.set(0, true);
    array.set(1, false);
    array.set(2, true);
    array.set(3, false);

    const result = [];
    for (const value of array) {
      result.push(value);
    }

    expect(result).toEqual([true, false, true, false]);
  });

  test("should work as an iterator directly", () => {
    const array = new FastBooleanArray(4);
    array.set(0, true);
    array.set(1, false);
    array.set(2, true);
    array.set(3, false);

    const iterator = array[Symbol.iterator]();
    expect(iterator.next().value).toBe(true);
    expect(iterator.next().value).toBe(false);
    expect(iterator.next().value).toBe(true);
    expect(iterator.next().value).toBe(false);
    expect(iterator.next().done).toBe(true);
  });

  test("getSafe throws below 0 and at size", () => {
    const array = new FastBooleanArray(8);
    expect(() => array.getSafe(-1)).toThrow("Index out of bounds");
    expect(() => array.getSafe(8)).toThrow("Index out of bounds");
  });

  test("setSafe throws below 0 and at size", () => {
    const array = new FastBooleanArray(8);
    expect(() => array.setSafe(-1, true)).toThrow("Index out of bounds");
    expect(() => array.setSafe(8, true)).toThrow("Index out of bounds");
  });

  test("unsafe get/set do not throw for out-of-range indices", () => {
    const array = new FastBooleanArray(8);
    expect(() => array.get(999)).not.toThrow();
    expect(() => array.set(999, true)).not.toThrow();
  });


  test("setSafe returns the provided value and updates exactly one bit", () => {
    const array = new FastBooleanArray(8);
    expect(array.setSafe(3, true)).toBe(true);
    expect(array.setSafe(3, false)).toBe(false);

    const a = new FastBooleanArray(16);
    a.setAll(false);
    a.setSafe(9, true);
    for (let i = 0; i < a.size; i++) {
      if (i === 9) expect(a.getSafe(i)).toBe(true);
      else expect(a.getSafe(i)).toBe(false);
    }
  });

  test("equals true when logical bits equal even if tail bits differ", () => {
    const a = new FastBooleanArray(9);
    const b = new FastBooleanArray(9);
    a.setAll(false);
    b.setAll(false);
    // Dirty an unused tail bit without changing any logical bits.
    b.set(15, true);
    expect(a.equals(b)).toBe(true);
  });

  test("equals false when any logical bit differs", () => {
    const a = new FastBooleanArray(17);
    const b = new FastBooleanArray(17);
    a.setAll(false);
    b.setAll(false);
    b.set(16, true);
    expect(a.equals(b)).toBe(false);
  });

  test("equals false when sizes differ", () => {
    const a = new FastBooleanArray(8);
    const b = new FastBooleanArray(9);
    expect(a.equals(b)).toBe(false);
  });

  test("setAll(true) then resize(smaller) must not keep phantom ones", () => {
    const x = new FastBooleanArray(16);
    x.setAll(true);
    x.resize(9);
    expect(x.toString()).toBe("111111111");
    expect(FastBooleanArray.fromString(x.toString()).equals(x)).toBe(true);
  });

  test("setAll(true) on non-multiple-of-8 size does not pollute equality", () => {
    const a = new FastBooleanArray(9);
    a.setAll(true);
    const b = FastBooleanArray.fromString("111111111");
    expect(a.equals(b)).toBe(true);
  });

  test("shrinking clears bits >= newSize and toString is correct", () => {
    const x = new FastBooleanArray(16);
    x.setAll(true);
    x.resize(9);
    expect(x.toString()).toBe("111111111");
    for (let i = 0; i < 9; i++) expect(x.getSafe(i)).toBe(true);
  });

  test("shrink then grow: newly added bits are zero-initialized", () => {
    const x = new FastBooleanArray(16);
    x.setAll(true);
    x.resize(9);
    x.resize(16);
    for (let i = 0; i < 9; i++) expect(x.getSafe(i)).toBe(true);
    for (let i = 9; i < 16; i++) expect(x.getSafe(i)).toBe(false);
  });

  test("iterator yields exactly size values", () => {
    const x = new FastBooleanArray(17);
    x.setAll(false);
    expect([...x].length).toBe(17);
  });

  test("iterator matches toArray()", () => {
    const size = 33;
    const x = new FastBooleanArray(size);
    const pattern: boolean[] = [];
    for (let i = 0; i < size; i++) {
      const v = Math.random() < 0.5;
      pattern.push(v);
      x.set(i, v);
    }
    expect([...x]).toEqual(x.toArray());
    expect([...x]).toEqual(pattern);
  });

  test("toString length equals size for various sizes", () => {
    const sizes = [1, 7, 9, 15, 17];
    for (const s of sizes) {
      const x = new FastBooleanArray(s);
      x.setAll(true);
      expect(x.toString().length).toBe(s);
    }
  });

  test("toString produces LSB-first ordering within each byte", () => {
    const x = new FastBooleanArray(8);
    x.setAll(false);
    x.set(0, true);
    expect(x.toString()).toBe("10000000");
    x.set(0, false);
    x.set(7, true);
    expect(x.toString()).toBe("00000001");
  });

  test("get returns boolean", () => {
    const x = new FastBooleanArray(1);
    expect(typeof x.get(0)).toBe("boolean");
  });

  test("set returns the passed boolean", () => {
    const x = new FastBooleanArray(1);
    expect(x.set(0, true)).toBe(true);
    expect(x.set(0, false)).toBe(false);
  });

  test("random ops vs reference array (property-style)", () => {
    const TRIALS = 5;
    for (let t = 0; t < TRIALS; t++) {
      let size = Math.floor(Math.random() * 256) + 1;
      const x = new FastBooleanArray(size);
      const ref: boolean[] = new Array(size).fill(false);

      const OPS = 200;
      for (let op = 0; op < OPS; op++) {
        const choice = Math.floor(Math.random() * 3);
        if (choice === 0) {
          // setSafe
          const i = Math.floor(Math.random() * size);
          const v = Math.random() < 0.5;
          x.setSafe(i, v);
          ref[i] = v;
        } else if (choice === 1) {
          // setAll
          const v = Math.random() < 0.5;
          x.setAll(v);
          for (let k = 0; k < size; k++) ref[k] = v;
        } else {
          // resize
          const newSize = Math.floor(Math.random() * 256) + 1;
          // adjust ref
          if (newSize < size) ref.length = newSize;
          else for (let k = size; k < newSize; k++) ref[k] = false;
          x.resize(newSize);
          size = newSize;
        }

        // assertions after each op
        for (let i = 0; i < size; i++) {
          expect(x.getSafe(i)).toBe(ref[i]);
        }
        const s = x.toString();
        expect(s).toBe(ref.map((b) => (b ? "1" : "0")).join(""));
        expect(FastBooleanArray.fromString(s).equals(x)).toBe(true);
      }
    }
  });
});

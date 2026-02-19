const ERROR_OUT_OF_BOUNDS = "Index out of bounds";

export default class FastBooleanArray {
  public size: number;
  private buffer: Uint8Array;

  constructor(size: number) {
    if (!size) {
      throw new Error("FastBooleanArray must have a size greater than 0");
    }
    this.size = size;
    this.buffer = new Uint8Array(Math.ceil(size / 8)); // Allocate memory
  }

  /**
   * Sets a boolean value at the specified index.
   * @param {number} index - The index to set the boolean value at.
   * @param {number} value - The boolean value to set the `index`.
   * @returns {boolean} The boolean value that was set.
   */
  set(index: number, value: boolean) {
    if (value) {
      this.buffer[index >> 3] |= 1 << (index & 7); // Set bit
      return true;
    } else {
      this.buffer[index >> 3] &= ~(1 << (index & 7)); // Clear bit
      return false;
    }
  }

  /**
   * like `set` but throws if the index is out of bounds (less than 0 or greater than or equal to the array size).
   * @param {number} index - The index to set the boolean value at.
   * @param {number} value - The boolean value to set the `index`.
   * @returns {boolean} The boolean value that was set.
   * @throws {RangeError} If the index is out of bounds (less than 0 or greater than or equal to the array size).
   */
  setSafe(index: number, value: boolean) {
    if (index < 0 || index >= this.size) {
      throw new RangeError(ERROR_OUT_OF_BOUNDS);
    }
    return this.set(index, value);
  }

  /**
   * Sets all bits to the specified boolean value.
   * @param {boolean} value - The boolean value to set all bits to.
   */
  setAll(value: boolean) {
    this.buffer.fill(value ? 0xff : 0x00);

    const rem = this.size & 7;
    if (value && rem !== 0) {
      const last = this.buffer.length - 1;
      this.buffer[last] &= (1 << rem) - 1;
    }
  }

  /**
   * Gets a boolean value at the specified index.
   * @param {number} index - The index to get the boolean value of.
   * @returns {boolean} The boolean value that was set.
   * @throws {RangeError} If the index is out of bounds (less than 0 or greater than or equal to the array size).
   */
  get(index: number) {
    return (this.buffer[index >> 3] >> (index & 7)) & 1 ? true : false;
  }

  /**
   * like `get` but throws if the index is out of bounds (less than 0 or greater than or equal to the array size).
   * @param {number} index - The index to get the boolean value of.
   * @returns {boolean} The boolean value that was set.
   * @throws {RangeError} If the index is out of bounds (less than 0 or greater than or equal to the array size).
   */
  getSafe(index: number) {
    if (index < 0 || index >= this.size) {
      throw new RangeError(ERROR_OUT_OF_BOUNDS);
    }
    return this.get(index);
  }

  /**
   * Resizes the array to a new size, preserving existing data.
   * @param {number} newSize - The new size of the array.
   */
  resize(newSize: number) {
    const newBuffer = new Uint8Array(Math.ceil(newSize / 8));
    newBuffer.set(
      this.buffer.subarray(0, Math.min(this.buffer.length, newBuffer.length))
    );
    this.size = newSize;
    this.buffer = newBuffer;
  }

  get length() {
    return this.size;
  }

  /**
   * Compares this FastBooleanArray with another for equality.
   * @param {FastBooleanArray} other - The other FastBooleanArray to compare.
   * @returns {boolean} True if both arrays are equal, false otherwise.
   */
  equals(other: FastBooleanArray) {
    if (this.size !== other.size) {
      return false;
    }
    return this.buffer.every((byte, i) => byte === other.buffer[i]);
  }

  /**
   * Makes the array iterable using `for...of`.
   */
  *[Symbol.iterator]() {
    for (let i = 0; i < this.size; i++) {
      yield this.get(i);
    }
  }

  /**
   * Converts to a standard JavaScript array.
   */
  toArray() {
    const arr = new Array(this.size);
    for (let i = 0; i < this.size; i++) {
      arr[i] = this.get(i);
    }
    return arr;
  }

  /**
   * Returns a proxy to the FastBooleanArray instance
   * With this you can access indexes like on an actual array.
   */
  accessLikeArray() {
    return new Proxy(this, {
      get: (target, prop) => {
        if (typeof prop === "string" && !isNaN(Number(prop))) {
          const index = Number(prop);
          return target.get(index);
        }
        return target[prop as keyof FastBooleanArray];
      },
      set: (target, prop, value) => {
        if (typeof prop === "string" && !isNaN(Number(prop))) {
          const index = Number(prop);
          target.set(index, value as never);
        } else {
          target[prop as Exclude<keyof FastBooleanArray, "length">] = value;
        }

        return true;
      },
    });
  }

  /**
   * Applies a callback function to each element in the array.
   * @param {Function} callback - The function to execute on each element.
   */
  forEach(
    callback: (value: boolean, index: number, array: FastBooleanArray) => void
  ) {
    for (let i = 0; i < this.size; i++) {
      callback(this.get(i), i, this);
    }
  }

  /**
   * Creates a new array with the results of calling a provided function on every element.
   * @param {Function} callback - The function to execute on each element.
   */
  map(
    callback: (value: boolean, index: number, array: FastBooleanArray) => never
  ) {
    const result = new Array(this.size);
    for (let i = 0; i < this.size; i++) {
      result[i] = callback(this.get(i), i, this);
    }
    return result;
  }

  /**
   * Creates a new array with all elements that pass the test implemented by the provided function.
   * @param {Function} callback - The function to test each element.
   */
  filter(
    callback: (
      value: boolean,
      index: number,
      array: FastBooleanArray
    ) => boolean
  ) {
    const result: boolean[] = [];
    for (let i = 0; i < this.size; i++) {
      const value = this.get(i);
      if (callback(value, i, this)) {
        result.push(value);
      }
    }
    return result;
  }

  /**
   * Tests whether at least one element in the array passes the test implemented by the provided function.
   * @param {Function} callback - The function to test each element.
   */
  some(
    callback: (
      value: boolean,
      index: number,
      array: FastBooleanArray
    ) => boolean
  ) {
    for (let i = 0; i < this.size; i++) {
      if (callback(this.get(i), i, this)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Tests whether all elements in the array pass the test implemented by the provided function.
   * @param {Function} callback - The function to test each element.
   */
  every(
    callback: (
      value: boolean,
      index: number,
      array: FastBooleanArray
    ) => boolean
  ) {
    for (let i = 0; i < this.size; i++) {
      if (!callback(this.get(i), i, this)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Reduces the array to a single value by applying a function to each element.
   * @param {Function} callback - The function to execute on each element.
   * @param {any} initialValue - The initial value for the accumulator.
   */
  reduce<T>(
    callback: (
      accumulator: T,
      value: boolean,
      index: number,
      array: FastBooleanArray
    ) => T,
    initialValue: T
  ): T {
    let accumulator = initialValue;
    for (let i = 0; i < this.size; i++) {
      accumulator = callback(accumulator, this.get(i), i, this);
    }
    return accumulator;
  }

  /**
   * Generates a string where every boolean is either a 0 or 1.
   */
  toString() {
    let result = ``;
    for (let i = 0; i < this.size; i++) {
      result += this.get(i) ? "1" : "0";
    }
    return result;
  }

  /**
   * Returns a FastBooleanArray from .toString() output
   */
  static fromString(value: string) {
    const array = new FastBooleanArray(value.length);
    for (let i = 0; i < value.length; i++) {
      array.set(i, value[i] == "1");
    }
    return array;
  }

  /**
   * Returns a FastBooleanArray from a boolean array or number array
   */
  static fromArray(value: boolean[] | number[]) {
    const array = new FastBooleanArray(value.length);
    for (let i = 0; i < value.length; i++) {
      array.set(i, !!value[i]);
    }
    return array;
  }

  /**
   * Returns a FastBooleanArray from a string, boolean array or number array
   */
  static from(value: string | boolean[] | number[]) {
    if (typeof value === "string") {
      return FastBooleanArray.fromString(value);
    }

    return FastBooleanArray.fromArray(value);
  }
}

# Fast Boolean Array ![Build](https://github.com/UltraCakeBakery/FastBooleanArray/actions/workflows/tests.yml/badge.svg?event=push)

In JavaScript, when working with large arrays of boolean values, a common challenge is efficiently indexing and retrieving these values. Using a regular JavaScript array to store booleans is straightforward, but it is memory-inefficient. While booleans are conceptually 1-bit values, JavaScript engines, like V8 (in Chrome and Node.js), allocate 1 byte (8 bits) per boolean for optimization purposes. This can waste a significant amount of memory when dealing with large arrays.

Fast Boolean Array solves this issue by utilizing bit manipulation to store booleans in a compact format. It uses a Uint8Array and stores each boolean as a single bit within the 8 bits of each byte. This allows you to index and retrieve boolean values by integers (e.g., the 0th boolean, 1st boolean, etc.) while only using a fraction of the memory.

For detailed benchmark results, see below.

## Features

- **Memory Efficiency**: Stores booleans in bits rather than bytes, drastically reducing memory usage.
- **Fast Set Performance**: Up to 10x faster sets for fast data re-mapping.
- **Familiar API**: `Map` and `Set` like API for minimal learning curve. Intuitive Array like helper functions, and works in `for.. of`.
---

## Usage example:

Here's how to use the Fast Boolean Array:

```javascript
import BooleanArray from "fast-boolean-array";

// Create a new BooleanArray with the desired length
const booleans = new BooleanArray(2);

// Set a value at a specific index
booleans.set(0, true);
booleans.set(1, false);

// Retrieve a value at a specific index
console.log(booleans.get(0)); // Output: true
console.log(booleans.get(1)); // Output: false

booleans.set(3, true); // will not throw, but returns false as the boolean is not found
console.log(booleans.get(3)); // Output: false

booleans.setSafe(3, true); // will throw RangeError because the array has a length of 2
```

---

## Installation

Install the package:

```bash
npm install fast-boolean-array
pnpm install fast-boolean-array
```

---

## API

### `new BooleanArray(size)`

Creates a new boolean array of the given size. All values are initialized to `false`.

- **Parameters:**
  - `size` (number): The number of booleans the array should hold.

### `set(index, value)`

Sets the boolean value at the specified index.

- **Parameters:**
  - `index` (number): The position in the array to set the value.
  - `value` (boolean): The value to set (`true` or `false`).

### `get(index)`

Gets the boolean value at the specified index.

- **Parameters:**

  - `index` (number): The position in the array to retrieve the value.

- **Returns:**
  - `boolean`: The value at the given index.

---

# Performance Breakdown

Our benchmark compares the performance of our Fast Boolean Array library against Vanilla JavaScript arrays in terms of get and set operations across varying numbers of Booleans. The results below reflect an updated benchmark algorithm that performs 1,000 runs for each x amount of Booleans to better simulate real-world scenarios. Generally you will notice the trend that as the size of the array grows, so does the justification of using our library instead of a regular vanilla JavaScript array.

## Performance Breakdown

### 1 Boolean

| Test                   | Time (ms)  | Memory (Bytes) | Booleans |
| ---------------------- | ---------- | -------------- | -------- |
| Set Vanilla Array      | 0.00236000 | 8              | 1        |
| Set Fast Boolean Array | 0.00423000 | 6              | 1        |
| Get Vanilla Array      | 0.00053000 | N/A            | 1        |
| Get Fast Boolean Array | 0.00291000 | N/A            | 1        |

As useless as having just 1 boolean stored in an array might be, For **1 boolean**, the **Fast Boolean Array** is **1.8x slower** for **Set** and **5.5x slower** for **Get** operations. Memory usage is nearly identical, with a small advantage for the **Fast Boolean Array** in terms of bytes.

---

### 100 Booleans

| Test                   | Time (ms)  | Memory (Bytes) | Booleans |
| ---------------------- | ---------- | -------------- | -------- |
| Set Vanilla Array      | 0.00332000 | 107            | 100      |
| Set Fast Boolean Array | 0.00824000 | 18             | 100      |
| Get Vanilla Array      | 0.00149000 | N/A            | 100      |
| Get Fast Boolean Array | 0.00581000 | N/A            | 100      |

For **100 booleans**, **Fast Boolean Array** is **2.5x slower** in **Set** operations but **3.9x more memory efficient**. However, **Fast Boolean Array**'s' **Get** operation is **3.9x slower** . compared to the **Vanilla Array**.

---

### 1,000 Booleans

| Test                   | Time (ms)  | Memory (Bytes) | Booleans |
| ---------------------- | ---------- | -------------- | -------- |
| Set Vanilla Array      | 0.09599000 | 1009           | 1000     |
| Set Fast Boolean Array | 0.04467000 | 130            | 1000     |
| Get Vanilla Array      | 0.01261000 | N/A            | 1000     |
| Get Fast Boolean Array | 0.05476000 | N/A            | 1000     |

For **1,000 booleans**, **Fast Boolean Array** is **2.1x faster** for **Set** operations and uses **7.7x less memory**. However, **Fast Boolean Array**'s' **Get** operation is **4.3x slower** . compared to the **Vanilla Array**.

---

### 10,000 Booleans

| Test                   | Time (ms)  | Memory (Bytes) | Booleans |
| ---------------------- | ---------- | -------------- | -------- |
| Set Vanilla Array      | 0.30075000 | 10009          | 10000    |
| Set Fast Boolean Array | 0.04225000 | 1256           | 10000    |
| Get Vanilla Array      | 0.06054000 | N/A            | 10000    |
| Get Fast Boolean Array | 0.12325000 | N/A            | 10000    |

**Observation:** For **10,000 booleans**, **Fast Boolean Array** is **7.1x faster** in **Set** operations and uses **8x less memory**. However, **Fast Boolean Array**'s' **Get** operation is **2x slower** . compared to the **Vanilla Array**.

---

### 100,000 Booleans

| Test                   | Time (ms)  | Memory (Bytes) | Booleans |
| ---------------------- | ---------- | -------------- | -------- |
| Set Vanilla Array      | 1.67949000 | 100011         | 100000   |
| Set Fast Boolean Array | 0.15400000 | 12506          | 100000   |
| Get Vanilla Array      | 0.04920000 | N/A            | 100000   |
| Get Fast Boolean Array | 0.07523000 | N/A            | 100000   |

For **100,000 booleans**, **Fast Boolean Array** is **10.9x faster** in **Set** operations and uses **8x less memory**. However, **Fast Boolean Array**'s' **Get** operation is **1.5x slower** .

---

### 1,000,000 Booleans

| Test                   | Time (ms)   | Memory (Bytes) | Booleans |
| ---------------------- | ----------- | -------------- | -------- |
| Set Vanilla Array      | 20.07889000 | 1000011        | 1000000  |
| Set Fast Boolean Array | 3.42817000  | 125007         | 1000000  |
| Get Vanilla Array      | 0.49531000  | N/A            | 1000000  |
| Get Fast Boolean Array | 0.74617000  | N/A            | 1000000  |

For **1,000,000 booleans**, the **Fast Boolean Array** is **5.9x faster** for **Set** operations and uses **8x less memory**. However, **Fast Boolean Array**'s' **Get** operation is **1.5x slower** .

---

### 10,000,000 Booleans

| Test                   | Time (ms)    | Memory (Bytes) | Booleans |
| ---------------------- | ------------ | -------------- | -------- |
| Set Vanilla Array      | 266.65778000 | 10000013       | 10000000 |
| Set Fast Boolean Array | 35.53492000  | 1250007        | 10000000 |
| Get Vanilla Array      | 4.90792000   | N/A            | 10000000 |
| Get Fast Boolean Array | 7.57038000   | N/A            | 10000000 |

For **10,000,000 booleans**, **Fast Boolean Array** is **7.5x faster** for **Set** operations and uses **8x less memory**. However, **Fast Boolean Array**'s' **Get** operation is **1.5x slower** .

---

### Summary

- The **Fast Boolean Array** is significantly more efficient in terms of memory usage and **Set** operation speeds, particularly as the number of booleans increases.
  - For example, as stated previously, at **10,000,000 booleans**, it is **7.5x faster** in **Set** operations and uses **8x less memory**.
- The **Get** operation, however, tends to be slower on a **Fast Boolean Array**, with it being up to **1.5x slower** compared to the regular vanilla **boolean[]** in larger datasets.

If memory efficiency and **Set** performance are priorities, the **Fast Boolean Array** is clearly advantageous, but if **Get** performance is more important, the **Vanilla Array** may still offer better results for certain use cases.

We are still working on improving the performance of the toArray function, but you can already use it today to convert back to a vanilla array, though generating one from scratch is currently more effecient.

---

## Contributing

Contributions are welcome! If you'd like to report a bug, suggest a feature, or submit a pull request, please visit the [GitHub repository](https://github.com/ultracakebakery/FastBooleanArray).

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgements

Thank you to the open-source community for inspiration and support!

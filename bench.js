import DevBooleanArray from "./dist/index.js";
import FastBooleanArray from "fast-boolean-array";
import { performance } from "node:perf_hooks";

function timeSync(fn) {
  const start = performance.now();
  fn();
  return performance.now() - start;
}

function avg(fn, runs) {
  let t = 0;
  for (let i = 0; i < runs; i++) t += fn();
  return t / runs;
}

function makeFilledInstance(Constructor, size) {
  const inst = new Constructor(size);
  for (let i = 0; i < size; i++) inst.set(i, (i & 1) === 0);
  return inst;
}

function runCompare(testName, devFn, relFn, runs = 5) {
  const devTime = avg(() => timeSync(devFn), runs);
  const relTime = avg(() => timeSync(relFn), runs);

  // ANSI colors
  const RESET = "\x1b[0m";
  const FG_GREEN = "\x1b[32m";
  const FG_RED = "\x1b[31m";
  const FG_YELLOW = "\x1b[33m";

  // consistent column widths
  const devStr = `${devTime.toFixed(4)} ms`.padStart(14);
  const relStr = `${relTime.toFixed(4)} ms`.padStart(14);
  const fasterTime = Math.min(devTime, relTime);
  const diffPct =
    ((Math.max(devTime, relTime) - fasterTime) / fasterTime) * 100 || 0;
  const diffStr = `${diffPct.toFixed(2)}%`.padStart(8);

  const winnerMarker =
    devTime < relTime ?
      `${FG_GREEN}(W: dev)${RESET}`
    : `${FG_GREEN}(W: rel)${RESET}`;

  console.log(
    `${testName.padEnd(28)} | dev:${devStr} | rel:${relStr} | diff:${diffStr} | ${winnerMarker}`,
  );

  return { testName, devTime, relTime };
}

// List of method tests. Each test returns a function for dev and release.
function makeTests(size) {
  const devFactory = () => makeFilledInstance(DevBooleanArray, size);
  const relFactory = () => makeFilledInstance(FastBooleanArray, size);

  return [
    // set (fresh instance)
    {
      name: "set",
      dev: () => {
        const a = new DevBooleanArray(size);
        for (let i = 0; i < size; i++) a.set(i, true);
      },
      rel: () => {
        const a = new FastBooleanArray(size);
        for (let i = 0; i < size; i++) a.set(i, true);
      },
    },
    // get
    {
      name: "get",
      dev: () => {
        const a = devFactory();
        for (let i = 0; i < size; i++) a.get(i);
      },
      rel: () => {
        const a = relFactory();
        for (let i = 0; i < size; i++) a.get(i);
      },
    },
    // setSafe
    {
      name: "setSafe",
      dev: () => {
        const a = new DevBooleanArray(size);
        for (let i = 0; i < size; i++) a.setSafe(i, true);
      },
      rel: () => {
        const a = new FastBooleanArray(size);
        for (let i = 0; i < size; i++) a.setSafe(i, true);
      },
    },
    // getSafe
    {
      name: "getSafe",
      dev: () => {
        const a = devFactory();
        for (let i = 0; i < size; i++) a.getSafe(i);
      },
      rel: () => {
        const a = relFactory();
        for (let i = 0; i < size; i++) a.getSafe(i);
      },
    },
    // setAll
    {
      name: "setAll",
      dev: () => {
        const a = new DevBooleanArray(size);
        a.setAll(true);
      },
      rel: () => {
        const a = new FastBooleanArray(size);
        a.setAll(true);
      },
    },
    // resize
    {
      name: "resize",
      dev: () => {
        const a = new DevBooleanArray(size);
        a.resize(size * 2);
      },
      rel: () => {
        const a = new FastBooleanArray(size);
        a.resize(size * 2);
      },
    },
    // equals
    {
      name: "equals",
      dev: () => {
        const a = devFactory();
        const b = devFactory();
        a.equals(b);
      },
      rel: () => {
        const a = relFactory();
        const b = relFactory();
        a.equals(b);
      },
    },
    // iterator
    {
      name: "iterator",
      dev: () => {
        const a = devFactory();
        for (const v of a);
      },
      rel: () => {
        const a = relFactory();
        for (const v of a);
      },
    },
    // toArray
    {
      name: "toArray",
      dev: () => {
        const a = devFactory();
        a.toArray();
      },
      rel: () => {
        const a = relFactory();
        a.toArray();
      },
    },
    // forEach
    {
      name: "forEach",
      dev: () => {
        const a = devFactory();
        a.forEach(() => {});
      },
      rel: () => {
        const a = relFactory();
        a.forEach(() => {});
      },
    },
    // map
    {
      name: "map",
      dev: () => {
        const a = devFactory();
        a.map((v) => v);
      },
      rel: () => {
        const a = relFactory();
        a.map((v) => v);
      },
    },
    // filter
    {
      name: "filter",
      dev: () => {
        const a = devFactory();
        a.filter((v) => v);
      },
      rel: () => {
        const a = relFactory();
        a.filter((v) => v);
      },
    },
    // some
    {
      name: "some",
      dev: () => {
        const a = devFactory();
        a.some((v) => v);
      },
      rel: () => {
        const a = relFactory();
        a.some((v) => v);
      },
    },
    // every
    {
      name: "every",
      dev: () => {
        const a = devFactory();
        a.every((v) => typeof v === "boolean");
      },
      rel: () => {
        const a = relFactory();
        a.every((v) => typeof v === "boolean");
      },
    },
    // reduce
    {
      name: "reduce",
      dev: () => {
        const a = devFactory();
        a.reduce((acc, v) => acc + (v ? 1 : 0), 0);
      },
      rel: () => {
        const a = relFactory();
        a.reduce((acc, v) => acc + (v ? 1 : 0), 0);
      },
    },
    // toString
    {
      name: "toString",
      dev: () => {
        const a = devFactory();
        a.toString();
      },
      rel: () => {
        const a = relFactory();
        a.toString();
      },
    },
    // static fromString
    {
      name: "fromString",
      dev: () => {
        DevBooleanArray.fromString("1".repeat(size));
      },
      rel: () => {
        FastBooleanArray.fromString("1".repeat(size));
      },
    },
    // static fromArray
    {
      name: "fromArray",
      dev: () => {
        DevBooleanArray.from(new Array(size).fill(true));
      },
      rel: () => {
        FastBooleanArray.from(new Array(size).fill(true));
      },
    },
    // static from
    {
      name: "from",
      dev: () => {
        DevBooleanArray.from(new Array(size).fill(true));
      },
      rel: () => {
        FastBooleanArray.from(new Array(size).fill(true));
      },
    },
  ];
}

console.clear();
const sizes = [100, 1_000, 10_000, 100_000, 1_000_000, 10_000_000];
const allResults = {};
for (const size of sizes) {
  console.log(`\n--- size: ${size} ---`);
  const tests = makeTests(size);
  let sizeDevTotal = 0;
  let sizeRelTotal = 0;
  // fixed number of runs per size
  const runsForSize = 5;
  for (const t of tests) {
    const res = runCompare(t.name, t.dev, t.rel, runsForSize);
    if (!allResults[t.name]) allResults[t.name] = { dev: 0, rel: 0, runs: 0 };
    allResults[t.name].dev += res.devTime;
    allResults[t.name].rel += res.relTime;
    allResults[t.name].runs += 1;
    sizeDevTotal += res.devTime;
    sizeRelTotal += res.relTime;
  }

  // per-size winner
  const RESET = "\x1b[0m";
  const FG_GREEN = "\x1b[32m";
  const winner = sizeDevTotal < sizeRelTotal ? "dev" : "release";
  const fasterTime = Math.min(sizeDevTotal, sizeRelTotal);
  const diffPct =
    ((Math.max(sizeDevTotal, sizeRelTotal) - fasterTime) / fasterTime) * 100;
  const winLabel =
    winner === "dev" ? `${FG_GREEN}Dev${RESET}` : `${FG_GREEN}Release${RESET}`;
  console.log(
    `${winLabel} winner for size ${size} — faster by ${diffPct.toFixed(2)}%`,
  );
}

// Summarize winners per function averaged across sizes
console.log("\n=== Summary (averaged across sizes) ===");
const RESET = "\x1b[0m";
const FG_GREEN = "\x1b[32m";
const FG_RED = "\x1b[31m";
const FG_CYAN = "\x1b[36m";

let devWins = 0,
  relWins = 0;

// header
console.log(
  `${"Function".padEnd(18)} | ${"dev".padStart(14)} | ${"rel".padStart(14)} | ${"diff".padStart(8)} | winner`,
);
for (const [name, data] of Object.entries(allResults)) {
  const devAvg = data.dev / data.runs;
  const relAvg = data.rel / data.runs;
  const faster = devAvg < relAvg ? "dev" : "rel";
  const fasterTime = Math.min(devAvg, relAvg);
  const diffPct =
    ((Math.max(devAvg, relAvg) - fasterTime) / fasterTime) * 100 || 0;

  const devStr = `${devAvg.toFixed(4)} ms`.padStart(14);
  const relStr = `${relAvg.toFixed(4)} ms`.padStart(14);
  const diffStr = `${diffPct.toFixed(2)}%`.padStart(8);
  const winnerMarker =
    faster === "dev" ? `${FG_GREEN}W: dev${RESET}` : `${FG_RED}W: rel${RESET}`;

  console.log(
    `${name.padEnd(18)} | ${devStr} | ${relStr} | ${diffStr} | ${winnerMarker}`,
  );

  if (faster === "dev") devWins++;
  else relWins++;
}

// overall winner
const overallWinner = devWins > relWins ? "Dev" : "Release";
const overallColor = devWins > relWins ? FG_GREEN : FG_RED;
console.log(
  `\n${FG_CYAN}Overall winner:${RESET} ${overallColor}${overallWinner}${RESET} (dev ${devWins} — rel ${relWins})`,
);

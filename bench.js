import DevBooleanArray from "./dist/index.mjs";
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

function makePlainArray(size) {
  const a = new Array(size);
  for (let i = 0; i < size; i++) a[i] = (i & 1) === 0;
  return a;
}

function runCompare(testName, devFn, relFn, vanFn, runs = 5) {
  const devTime = avg(() => timeSync(devFn), runs);
  const relTime = avg(() => timeSync(relFn), runs);
  const vanTime = avg(() => timeSync(vanFn), runs);

  // ANSI colors
  const RESET = "\x1b[0m";
  const FG_GREEN = "\x1b[32m";
  const FG_RED = "\x1b[31m";
  const FG_YELLOW = "\x1b[33m";

  // consistent column widths
  const devStr = `${devTime.toFixed(4)} ms`.padStart(14);
  const relStr = `${relTime.toFixed(4)} ms`.padStart(14);
  const vanStr = `${vanTime.toFixed(4)} ms`.padStart(14);
  const fasterTime = Math.min(devTime, relTime, vanTime);
  const diffPct =
    ((Math.max(devTime, relTime, vanTime) - fasterTime) / fasterTime) * 100 ||
    0;
  const diffStr = `${diffPct.toFixed(2)}%`.padStart(8);

  let winnerMarker;
  if (devTime === fasterTime) winnerMarker = `${FG_GREEN}(W: dev)${RESET}`;
  else if (relTime === fasterTime) winnerMarker = `${FG_GREEN}(W: rel)${RESET}`;
  else winnerMarker = `${FG_GREEN}(W: van)${RESET}`;

  console.log(
    `${testName.padEnd(28)} | dev:${devStr} | rel:${relStr} | van:${vanStr} | diff:${diffStr} | ${winnerMarker}`,
  );

  return { testName, devTime, relTime, vanTime };
}

// List of method tests. Each test returns a function for dev and release.
function makeTests(size) {
  const devFactory = () => makeFilledInstance(DevBooleanArray, size);
  const relFactory = () => makeFilledInstance(FastBooleanArray, size);
  const vanFactory = () => makePlainArray(size);

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
      van: () => {
        const a = new Array(size);
        for (let i = 0; i < size; i++) a[i] = true;
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
      van: () => {
        const a = vanFactory();
        for (let i = 0; i < size; i++) void a[i];
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
      van: () => {
        const a = new Array(size);
        for (let i = 0; i < size; i++) a[i] = true;
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
      van: () => {
        const a = vanFactory();
        for (let i = 0; i < size; i++) {
          const v = a[i];
        }
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
      van: () => {
        const a = new Array(size).fill(true);
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
      van: () => {
        const a = new Array(size);
        a.length = size * 2;
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
      van: () => {
        const a = vanFactory();
        const b = vanFactory();
        for (let i = 0; i < a.length; i++) {
          if (a[i] !== b[i]) break;
        }
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
      van: () => {
        const a = vanFactory();
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
      van: () => {
        const a = vanFactory();
        a.slice();
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
      van: () => {
        const a = vanFactory();
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
      van: () => {
        const a = vanFactory();
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
      van: () => {
        const a = vanFactory();
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
      van: () => {
        const a = vanFactory();
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
      van: () => {
        const a = vanFactory();
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
      van: () => {
        const a = vanFactory();
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
      van: () => {
        const a = vanFactory();
        a.map((v) => (v ? "1" : "0")).join("");
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
      van: () => {
        Array.from("1".repeat(size), (c) => c === "1");
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
      van: () => {
        Array.from(new Array(size).fill(true));
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
      van: () => {
        Array.from(new Array(size).fill(true));
      },
    },
  ];
}

console.clear();
const sizes = [1, 10, 100, 1_000, 10_000, 100_000, 1_000_000, 10_000_000];
const allResults = {};
for (const size of sizes) {
  console.log(`\n--- size: ${size} ---`);
  const tests = makeTests(size);
  let sizeDevTotal = 0;
  let sizeRelTotal = 0;
  let sizeVanTotal = 0;
  // fixed number of runs per size
  const runsForSize = 5;
  for (const t of tests) {
    const res = runCompare(t.name, t.dev, t.rel, t.van, runsForSize);
    if (!allResults[t.name])
      allResults[t.name] = { dev: 0, rel: 0, van: 0, runs: 0 };
    allResults[t.name].dev += res.devTime;
    allResults[t.name].rel += res.relTime;
    allResults[t.name].van += res.vanTime;
    allResults[t.name].runs += 1;
    sizeDevTotal += res.devTime;
    sizeRelTotal += res.relTime;
    sizeVanTotal += res.vanTime;
  }

  // per-size winner
  const RESET = "\x1b[0m";
  const FG_GREEN = "\x1b[32m";
  const fasterTime = Math.min(sizeDevTotal, sizeRelTotal, sizeVanTotal);
  const maxTime = Math.max(sizeDevTotal, sizeRelTotal, sizeVanTotal);
  const diffPct = ((maxTime - fasterTime) / fasterTime) * 100;
  const winnerLabel =
    fasterTime === sizeDevTotal ? `${FG_GREEN}Dev${RESET}`
    : fasterTime === sizeRelTotal ? `${FG_GREEN}Release${RESET}`
    : `${FG_GREEN}Plain${RESET}`;
  console.log(
    `${winnerLabel} winner for size ${size} — faster by ${diffPct.toFixed(2)}%`,
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
let vanWins = 0;

// header
console.log(
  `${"Function".padEnd(18)} | ${"dev".padStart(14)} | ${"rel".padStart(14)} | ${"van".padStart(14)} | ${"diff".padStart(8)} | winner`,
);
for (const [name, data] of Object.entries(allResults)) {
  const devAvg = data.dev / data.runs;
  const relAvg = data.rel / data.runs;
  const vanAvg = (data.van || 0) / data.runs;
  const fasterAll = Math.min(devAvg, relAvg, vanAvg);
  const maxAll = Math.max(devAvg, relAvg, vanAvg);
  const diffPct = ((maxAll - fasterAll) / fasterAll) * 100 || 0;

  const devStr = `${devAvg.toFixed(4)} ms`.padStart(14);
  const relStr = `${relAvg.toFixed(4)} ms`.padStart(14);
  const vanStr = `${vanAvg.toFixed(4)} ms`.padStart(14);
  const diffStr = `${diffPct.toFixed(2)}%`.padStart(8);
  const winnerMarker =
    fasterAll === devAvg ? `${FG_GREEN}W: dev${RESET}`
    : fasterAll === relAvg ? `${FG_RED}W: rel${RESET}`
    : `${FG_GREEN}W: van${RESET}`;

  console.log(
    `${name.padEnd(18)} | ${devStr} | ${relStr} | ${vanStr} | ${diffStr} | ${winnerMarker}`,
  );

  if (fasterAll === devAvg) devWins++;
  else if (fasterAll === relAvg) relWins++;
  else vanWins++;
}

// overall winner
const counts = { dev: devWins, rel: relWins, van: vanWins };
const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
const overallColor =
  best === "dev" ? FG_GREEN
  : best === "rel" ? FG_RED
  : FG_GREEN;
const overallLabel =
  best === "dev" ? "Dev"
  : best === "rel" ? "Release"
  : "Plain";
console.log(
  `\n${FG_CYAN}Overall winner:${RESET} ${overallColor}${overallLabel}${RESET} (dev ${devWins} — rel ${relWins} — van ${vanWins})`,
);

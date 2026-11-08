import test from "node:test";
import assert from "node:assert/strict";
import { buildSingleEliminationBracket } from "../bracket-engine.js";

const player = id => ({ id: String(id) });
const stableRandom = () => 0.5;

test("odd player counts reserve exactly one player", () => {
  for (const n of [3, 5, 9, 99, 101]) {
    const result = buildSingleEliminationBracket(Array.from({length:n}, (_,i)=>player(i+1)), stableRandom);
    assert.equal(result.reserves.length, 1);
    assert.equal(result.players.length, n - 1);
    assert.equal(new Set([...result.players, ...result.reserves].map(p=>p.id)).size, n);
  }
});

test("even player counts do not create reserves", () => {
  for (const n of [2, 8, 16, 32, 64, 100]) {
    const result = buildSingleEliminationBracket(Array.from({length:n}, (_,i)=>player(i+1)), stableRandom);
    assert.equal(result.reserves.length, 0);
    assert.equal(result.players.length, n);
  }
});

test("one or zero players creates no match", () => {
  assert.equal(buildSingleEliminationBracket([]).matches.length, 0);
  assert.equal(buildSingleEliminationBracket([player(1)]).matches.length, 0);
});

test("duplicate player IDs are rejected", () => {
  assert.throws(() => buildSingleEliminationBracket([player(1), player(1)]), /Duplicate player id/);
});

test("missing IDs are rejected", () => {
  assert.throws(() => buildSingleEliminationBracket([{id:""}, player(2)]), /non-empty string id/);
});

test("random source outside [0,1) is rejected", () => {
  assert.throws(() => buildSingleEliminationBracket([player(1),player(2)], () => 1), /random must return/);
});

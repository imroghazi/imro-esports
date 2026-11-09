import test from "node:test";
import assert from "node:assert/strict";
import { buildSingleEliminationBracket, prepareTierBracketPlayers } from "../bracket-engine.js";

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

test("every non-final match links to exactly one next-round slot", () => {
  for (const n of [2, 4, 6, 8, 16, 32, 64, 98, 100]) {
    const result = buildSingleEliminationBracket(
      Array.from({length:n}, (_,i)=>player(i+1)),
      stableRandom
    );
    for (const round of result.rounds.slice(0, -1)) {
      for (const match of round.matches) {
        assert.ok(match.nextMatch);
        assert.ok([1,2].includes(match.nextMatchSlot));
        assert.equal(match.nextMatch.round, match.round + 1);
      }
    }
    for (const match of result.rounds.at(-1)?.matches || []) {
      assert.equal(match.nextMatch, null);
    }
  }
});

test("all active players appear once in the initial bracket", () => {
  for (const n of [2, 4, 6, 8, 16, 32, 64, 98, 100]) {
    const result = buildSingleEliminationBracket(
      Array.from({length:n}, (_,i)=>player(i+1)),
      stableRandom
    );
    const initial = [
      ...result.rounds[0].byes.map(x=>x.player.id),
      ...result.rounds[0].matches.flatMap(m=>[m.playerOne.id,m.playerTwo.id])
    ];
    assert.equal(initial.length, result.players.length);
    assert.equal(new Set(initial).size, result.players.length);
  }
});

test("tier adapter includes only approved players from the selected tier", () => {
  const records = [
    {id:"a", player_name:"A", tier:1, status:"approved"},
    {id:"b", player_name:"B", tier:1, status:"pending"},
    {id:"c", player_name:"C", tier:2, status:"approved"},
    {id:"d", player_name:"D", tier:"1", status:"approved"},
    {id:"e", player_name:"E", tier:1, status:"eliminated"}
  ];
  assert.deepEqual(prepareTierBracketPlayers(records, 1), [
    {id:"a", name:"A"},
    {id:"d", name:"D"}
  ]);
});

test("tier adapter rejects invalid tiers and malformed eligible IDs", () => {
  assert.throws(() => prepareTierBracketPlayers([], 4), /tier must be/);
  assert.throws(() => prepareTierBracketPlayers([{id:"",tier:1,status:"approved"}], 1), /non-empty string id/);
});

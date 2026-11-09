// Pure single-elimination bracket planner. It performs no database calls or side effects.
export function buildSingleEliminationBracket(input, random = Math.random) {
  if (!Array.isArray(input)) throw new TypeError("players must be an array");
  const seen = new Set();
  for (const player of input) {
    if (!player || typeof player.id !== "string" || !player.id.trim()) {
      throw new TypeError("Every player must have a non-empty string id");
    }
    if (seen.has(player.id)) throw new Error("Duplicate player id: " + player.id);
    seen.add(player.id);
  }

  const shuffled = input.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const sample = Number(random());
    if (!(sample >= 0 && sample < 1)) throw new RangeError("random must return a value in [0, 1)");
    const j = Math.floor(sample * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Existing tournament rule: if a tier has an odd field, one player is held in reserve.
  const reserves = shuffled.length % 2 ? [shuffled.pop()] : [];
  const active = shuffled;
  if (active.length < 2) {
    return { players: active, reserves, rounds: [], matches: [], champion: active[0] || null, bracketSize: active.length, matchCount: 0, byeCount: 0 };
  }

  const bracketSize = 2 ** Math.ceil(Math.log2(active.length));
  const byeCount = bracketSize - active.length;
  const byes = active.slice(0, byeCount).map(player => ({ player, advances: true }));
  const playing = active.slice(byeCount);
  const firstRoundMatches = [];
  for (let i = 0; i < playing.length; i += 2) {
    firstRoundMatches.push({
      round: 1,
      playerOne: playing[i],
      playerTwo: playing[i + 1],
      nextMatch: null,
      nextMatchSlot: null,
    });
  }

  const rounds = [{ number: 1, matches: firstRoundMatches, byes }];
  let entrants = [
    ...byes.map(item => ({ kind: "player", player: item.player })),
    ...firstRoundMatches.map(match => ({ kind: "winner", match })),
  ];
  let roundNumber = 2;

  while (entrants.length > 1) {
    const matches = [];
    for (let i = 0; i < entrants.length; i += 2) {
      const one = entrants[i];
      const two = entrants[i + 1];
      const match = {
        round: roundNumber,
        playerOne: one.kind === "player" ? one.player : null,
        playerTwo: two.kind === "player" ? two.player : null,
        nextMatch: null,
        nextMatchSlot: null,
      };
      if (one.kind === "winner") {
        one.match.nextMatch = match;
        one.match.nextMatchSlot = 1;
      }
      if (two.kind === "winner") {
        two.match.nextMatch = match;
        two.match.nextMatchSlot = 2;
      }
      matches.push(match);
    }
    rounds.push({ number: roundNumber, matches, byes: [] });
    entrants = matches.map(match => ({ kind: "winner", match }));
    roundNumber++;
  }

  const allMatches = rounds.flatMap(round => round.matches);
  return {
    players: active,
    reserves,
    rounds,
    matches: allMatches,
    champion: null,
    bracketSize,
    matchCount: allMatches.length,
    byeCount,
  };
}

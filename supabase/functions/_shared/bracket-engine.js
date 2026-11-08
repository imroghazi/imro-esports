// Pure tournament bracket helpers. No database calls or side effects.
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

  const reserves = shuffled.length % 2 ? [shuffled.pop()] : [];
  const active = shuffled;
  if (active.length < 2) {
    return { players: active, reserves, rounds: [], matches: [], champion: active[0] || null };
  }

  const bracketSize = 2 ** Math.ceil(Math.log2(active.length));
  const firstRoundSlots = [];
  for (let i = 0; i < active.length; i += 2) {
    firstRoundSlots.push({ playerOne: active[i], playerTwo: active[i + 1] });
  }

  // Byes are explicit bracket slots. They advance only the single present player.
  const byeCount = bracketSize - active.length;
  const byes = active.slice(0, byeCount).map(player => ({ player, advances: true }));
  const rounds = [{ number: 1, matches: firstRoundSlots, byes }];
  let matchCount = firstRoundSlots.length;
  let width = Math.ceil(bracketSize / 2);
  let roundNumber = 2;
  while (width > 1) {
    rounds.push({ number: roundNumber++, matches: Array.from({ length: Math.floor(width / 2) }, () => ({ playerOne: null, playerTwo: null })), byes: [] });
    matchCount += rounds[rounds.length - 1].matches.length;
    width = Math.ceil(width / 2);
  }

  return { players: active, reserves, rounds, matches: rounds.flatMap(r => r.matches), champion: null, bracketSize, matchCount, byeCount };
}

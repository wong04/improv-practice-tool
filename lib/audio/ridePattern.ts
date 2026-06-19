import { Subdivision } from "./metronome";

/**
 * Off-beat "skip note" positions (0-based beat indices) for each feel.
 *
 * A quarter-note "ding" lands on every beat via fire(). fireSub() fires an
 * additional off-beat note after each beat whose index appears here.
 *
 *   swing      "1 2-da 3 4-da"   spang-a-lang: skip after beats 2 & 4
 *   straight   all 8 8th-note positions: skip after every beat
 *   bossanova  all 8 8th-note positions: steady hihat feel (clave on rim click)
 *
 * Meter variants for swing:
 *   3/4  skip after beat 2 only
 *   2/4  skip after beat 2 only
 *   6/8  skip after beats 2 & 5
 */
export function rideSkipBeats(beatsPerBar: number, subdivision: Subdivision): number[] {
	if (subdivision === "straight" || subdivision === "bossanova") return [0, 1, 2, 3];
	switch (beatsPerBar) {
		case 2:
			return [1];
		case 3:
			return [1];
		case 6:
			return [1, 4];
		default:
			return [1, 3];
	}
}

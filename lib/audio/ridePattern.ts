import { Subdivision } from "./metronome";

/**
 * Jazz ride cymbal ("spang-a-lang") pattern, by meter.
 *
 * A quarter-note "ding" lands on every beat. On top of that, a swung "skip note"
 * is played on the off-beat *after* certain beats — that skip is what gives the
 * pattern its lilt. This returns those beats (0-based) for a given beats-per-bar.
 *
 *   4/4  "1 2-da 3 4-da"        skip after beats 2 & 4
 *   3/4  "1 2-da 3"  (waltz)    skip after beat 2
 *   2/4  "1 2-da"               skip after beat 2 (into the next downbeat)
 *   6/8  "1 2-da 3 | 4 5-da 6"  two waltz cells, skip after beats 2 & 5
 *
 * Bossa nova plays straight quarters only — no skip notes.
 */
export function rideSkipBeats(beatsPerBar: number, subdivision: Subdivision): number[] {
	if (subdivision === "bossanova") return [];
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

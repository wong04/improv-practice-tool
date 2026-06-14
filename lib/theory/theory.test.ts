import { describe, expect, it } from "vitest";
import { Note } from "tonal";
import { formatChord } from "./qualities";
import { KEYS, transposeForInstrument } from "./transpose";
import { Level, qualityPool, randomChord, TIERS } from "./chordPool";
import { expandProgression } from "./progressionEngine";
import { PROGRESSIONS } from "./progressions";

function progById(id: string) {
	const p = PROGRESSIONS.find((x) => x.id === id);
	if (!p) throw new Error(`no progression ${id}`);
	return p;
}

describe("formatChord", () => {
	it("renders major triads as the bare root", () => {
		expect(formatChord("C", "maj")).toBe("C");
	});
	it("renders quality suffixes", () => {
		expect(formatChord("C", "maj7")).toBe("Cmaj7");
		expect(formatChord("D", "7b9")).toBe("D7♭9");
		expect(formatChord("F", "m7b5")).toBe("Fm7♭5");
	});
	it("collapses double accidentals", () => {
		expect(formatChord("E##", "7")).toBe("F♯7");
	});
});

describe("ii–V–I expands correctly in all 12 keys", () => {
	const prog = progById("ii-v-i-major");
	for (const key of KEYS) {
		it(`key of ${key}`, () => {
			const [ii, v, i] = expandProgression(prog, key);
			expect(ii.root).toBe(Note.transpose(key, "2M"));
			expect(ii.quality).toBe("m7");
			expect(v.root).toBe(Note.transpose(key, "5P"));
			expect(v.quality).toBe("7");
			expect(i.root).toBe(key);
			expect(i.quality).toBe("maj7");
		});
	}

	it("matches the canonical concert-C voicing", () => {
		const symbols = expandProgression(prog, "C").map((c) => c.symbol);
		expect(symbols).toEqual(["Dm7", "G7", "Cmaj7"]);
	});
});

describe("instrument transposition", () => {
	it("writes a major 2nd up for B♭ instruments", () => {
		expect(transposeForInstrument("C", "Bb")).toBe("D");
		expect(transposeForInstrument("Bb", "Bb")).toBe("C");
	});
	it("writes a major 6th up for E♭ instruments", () => {
		expect(transposeForInstrument("C", "Eb")).toBe("A");
	});
	it("writes a perfect 5th up for F instruments", () => {
		expect(transposeForInstrument("C", "F")).toBe("G");
	});
	it("transposes a whole progression for the player's horn", () => {
		const prog = progById("ii-v-i-major");
		const symbols = expandProgression(prog, "C", "Bb").map((c) => c.symbol);
		expect(symbols).toEqual(["Em7", "A7", "Dmaj7"]);
	});
});

describe("difficulty tiers", () => {
	it("is cumulative — higher levels include easier qualities", () => {
		expect(qualityPool(2)).toEqual(expect.arrayContaining(TIERS[1].qualities));
		expect(qualityPool(4)).toEqual(
			expect.arrayContaining([...TIERS[1].qualities, ...TIERS[4].qualities]),
		);
	});

	for (const level of [1, 2, 3, 4] as Level[]) {
		it(`level ${level} only ever produces qualities from its pool`, () => {
			const pool = new Set(qualityPool(level));
			for (let n = 0; n < 200; n++) {
				const chord = randomChord(level, "all");
				expect(pool.has(chord.quality)).toBe(true);
			}
		});
	}

	it("respects a locked key", () => {
		for (let n = 0; n < 50; n++) {
			expect(randomChord(1, "Eb").root).toBe("Eb");
		}
	});

	it("favours the selected tier's own qualities", () => {
		const tier4 = new Set(TIERS[4].qualities);
		let inTier = 0;
		const draws = 4000;
		for (let n = 0; n < draws; n++) {
			if (tier4.has(randomChord(4, "all").quality)) inTier++;
		}
		// Uniform over the full level-4 pool would be ~5/23 ≈ 22%; the bias lifts it well past 40%.
		expect(inTier / draws).toBeGreaterThan(0.4);
	});
});

describe("reharmonizations expand to the expected chords", () => {
	it("tritone sub in C", () => {
		const symbols = expandProgression(progById("tritone-sub"), "C").map((c) => c.symbol);
		expect(symbols).toEqual(["Dm7", "D♭7", "Cmaj7"]);
	});
	it("backdoor ii–V in C", () => {
		const symbols = expandProgression(progById("backdoor-ii-v"), "C").map((c) => c.symbol);
		expect(symbols).toEqual(["Fm7", "B♭7", "Cmaj7"]);
	});
});

describe("every catalog progression resolves without empty roots", () => {
	for (const prog of PROGRESSIONS) {
		it(prog.id, () => {
			const chords = expandProgression(prog, prog.defaultTonic);
			expect(chords.length).toBe(prog.chords.length);
			for (const chord of chords) {
				expect(chord.root).toMatch(/^[A-G]/);
				expect(chord.beats).toBeGreaterThan(0);
			}
		});
	}
});

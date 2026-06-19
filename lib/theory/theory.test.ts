import { describe, expect, it } from "vitest";
import { Note } from "tonal";
import { formatChord, QUALITIES } from "./qualities";
import { KEYS, transposeForInstrument } from "./transpose";
import { Level, qualityPool, randomChord, TIERS } from "./chordPool";
import { tonicChord } from "./keyHarmony";
import { scaleForChord, chordTones } from "./scales";
import { makeQualityQuestion, makeQuestion } from "../ear/earQuestion";
import { bassNote } from "../audio/bassNote";
import { rideSkipBeats } from "../audio/ridePattern";
import { establishKeyCadence } from "./keyHarmony";
import { makeDegreeQuestion } from "../ear/degreeQuestion";
import { EarItem } from "../ear/earItem";
import { EarTestResult, summarizeTest } from "../ear/testSummary";
import { STANDARDS } from "../standards/standards";
import { standardToProgression } from "../standards/standardProgression";
import { expandProgression } from "./progressionEngine";
import { PROGRESSIONS } from "./progressions";

function progById(id: string) {
	const p = PROGRESSIONS.find((x) => x.id === id);
	if (!p) throw new Error(`no progression ${id}`);
	return p;
}

describe("formatChord", () => {
	it("renders major triads with Maj suffix", () => {
		expect(formatChord("C", "maj")).toBe("CMaj");
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
		it(`level ${level} (all keys) only ever produces qualities from its pool`, () => {
			const pool = new Set(qualityPool(level));
			for (let n = 0; n < 200; n++) {
				const chord = randomChord(level, "all", "major");
				expect(pool.has(chord.quality)).toBe(true);
			}
		});
	}

	it("favours the selected tier's own qualities (all keys)", () => {
		const tier4 = new Set(TIERS[4].qualities);
		let inTier = 0;
		const draws = 4000;
		for (let n = 0; n < draws; n++) {
			if (tier4.has(randomChord(4, "all", "major").quality)) inTier++;
		}
		// Uniform over the full level-4 pool would be ~5/23 ≈ 22%; the bias lifts it well past 40%.
		expect(inTier / draws).toBeGreaterThan(0.4);
	});
});

describe("key-aware drill (diatonic + borrowed)", () => {
	const draws = (level: Level, key: string, tonality: "major" | "minor", n = 400) =>
		new Set(
			Array.from({ length: n }, () => randomChord(level, key, tonality).symbol),
		);

	it("C major L1 stays within the diatonic triads", () => {
		const allowed = new Set(["CMaj", "Dm", "Em", "FMaj", "GMaj", "Am", "B°"]);
		for (const s of draws(1, "C", "major")) expect(allowed.has(s)).toBe(true);
	});

	it("C major L2 stays diatonic (triads + 7ths, cumulative)", () => {
		const allowed = new Set([
			// L1 triads
			"CMaj", "Dm", "Em", "FMaj", "GMaj", "Am", "B°",
			// L2 sevenths
			"Cmaj7", "Dm7", "Em7", "Fmaj7", "G7", "Am7", "Bm7♭5",
		]);
		for (const s of draws(2, "C", "major")) expect(allowed.has(s)).toBe(true);
	});

	it("C minor L2 stays diatonic (triads + 7ths, cumulative)", () => {
		const allowed = new Set([
			// L1 triads
			"Cm", "D°", "E♭Maj", "Fm", "GMaj", "A♭Maj", "B♭Maj",
			// L2 sevenths
			"Cm7", "Dm7♭5", "E♭maj7", "Fm7", "G7", "A♭maj7", "B♭maj7",
		]);
		for (const s of draws(2, "C", "minor")) expect(allowed.has(s)).toBe(true);
	});

	it("borrowed chords only appear at L4, not L1–L2", () => {
		const borrowed = ["Fm7", "A♭maj7", "B♭7", "D♭maj7"];
		const l2 = draws(2, "C", "major");
		for (const b of borrowed) expect(l2.has(b)).toBe(false);
		const l4 = draws(4, "C", "major", 800);
		expect(borrowed.some((b) => l4.has(b))).toBe(true);
	});
});

describe("tonic chord (first chord on start)", () => {
	it("is the key's I chord at the current level", () => {
		expect(tonicChord("Eb", "major", 2).symbol).toBe("E♭maj7");
		expect(tonicChord("Eb", "major", 2).roman).toBe("Imaj7");
		expect(tonicChord("Eb", "major", 1).symbol).toBe("E♭Maj");
		expect(tonicChord("C", "minor", 2).symbol).toBe("Cm7");
		expect(tonicChord("C", "minor", 2).roman).toBe("i7");
	});
});

describe("walking bass", () => {
	const C = { root: "C", quality: "maj7" as const, beatsPerBar: 4 };

	it("roots mode plays root on 1 and fifth on 3", () => {
		expect(bassNote({ mode: "roots", beat: 0, ...C })).toBe("C");
		expect(bassNote({ mode: "roots", beat: 2, ...C })).toBe("G");
		expect(bassNote({ mode: "roots", beat: 1, ...C })).toBeNull();
	});

	it("walking plays root, chord tones, then approaches the next root", () => {
		expect(bassNote({ mode: "walking", beat: 0, ...C })).toBe("C");
		expect(bassNote({ mode: "walking", beat: 1, ...C })).toBe("E"); // 3rd
		expect(bassNote({ mode: "walking", beat: 2, ...C })).toBe("G"); // 5th
		// last beat: half-step below the next root (F) → E
		expect(bassNote({ mode: "walking", beat: 3, nextRoot: "F", ...C })).toBe("E");
	});

	it("off mode is silent", () => {
		expect(bassNote({ mode: "off", beat: 0, ...C })).toBeNull();
	});
});

describe("ride pattern skip beats by subdivision", () => {
	// Beats are 0-based; a "ding" lands on every beat, these get the off-beat skip note.
	it("swing 4/4 skips after beats 2 and 4 (spang-a-lang)", () => {
		expect(rideSkipBeats(4, "swing")).toEqual([1, 3]);
	});
	it("swing 3/4 jazz waltz skips after beat 2 only", () => {
		expect(rideSkipBeats(3, "swing")).toEqual([1]);
	});
	it("swing 2/4 skips after beat 2", () => {
		expect(rideSkipBeats(2, "swing")).toEqual([1]);
	});
	it("swing 6/8 (two waltz cells) skips after beats 2 and 5", () => {
		expect(rideSkipBeats(6, "swing")).toEqual([1, 4]);
	});
	it("straight fires skip notes after all 4 beats (true 8th notes)", () => {
		expect(rideSkipBeats(4, "straight")).toEqual([0, 1, 2, 3]);
	});
	it("bossa nova fires skip notes after all 4 beats (steady hihat 8ths)", () => {
		expect(rideSkipBeats(4, "bossanova")).toEqual([0, 1, 2, 3]);
	});
});

describe("establishKeyCadence (I–IV–V–I)", () => {
	it("major: C → C F G C, all major", () => {
		const cadence = establishKeyCadence("C", "major");
		expect(cadence.map((c) => c.concertRoot)).toEqual(["C", "F", "G", "C"]);
		expect(cadence.map((c) => c.quality)).toEqual(["maj", "maj", "maj", "maj"]);
	});
	it("minor: A → A D E A, with a major V", () => {
		const cadence = establishKeyCadence("A", "minor");
		expect(cadence.map((c) => c.concertRoot)).toEqual(["A", "D", "E", "A"]);
		expect(cadence.map((c) => c.quality)).toEqual(["min", "min", "maj", "min"]);
	});
});

describe("scale-degree ear questions", () => {
	it("level 1 only draws tonic-triad degrees (1, 3, 5)", () => {
		for (let n = 0; n < 200; n++) {
			const q = makeDegreeQuestion({ keyChoice: "C", tonality: "major", level: 1 });
			expect([0, 2, 4]).toContain(q.targetIndex);
		}
	});
	it("target note matches the key's scale degree", () => {
		const q = makeDegreeQuestion({ keyChoice: "C", tonality: "major", level: 1 });
		expect(q.scaleNotes.slice(0, 7)).toEqual(["C", "D", "E", "F", "G", "A", "B"]);
		expect(q.targetNote).toBe(`${q.scaleNotes[q.targetIndex]}4`);
	});
	it("minor uses the natural-minor scale", () => {
		const q = makeDegreeQuestion({ keyChoice: "C", tonality: "minor", level: 2 });
		expect(q.scaleNotes.slice(0, 7)).toEqual(["C", "D", "Eb", "F", "G", "Ab", "Bb"]);
	});
	it("options are distinct and include the target at correctIndex", () => {
		for (let n = 0; n < 100; n++) {
			const q = makeDegreeQuestion({ keyChoice: "G", tonality: "major", level: 3 });
			expect(new Set(q.options).size).toBe(q.options.length);
			expect(q.options[q.correctIndex]).toBe(q.targetIndex);
			expect(q.labels.length).toBe(q.options.length);
		}
	});
});

describe("ear test scoring", () => {
	const item = (labels: string[], correctIndex: number, categoryLabel: string): EarItem => ({
		mode: "quality",
		labels,
		correctIndex,
		categoryLabel,
		revealNotes: [],
		prompt: { kind: "chord", root: "C", quality: "maj" },
	});
	const results: EarTestResult[] = [
		{ item: item(["I", "IV", "V", "vi"], 0, "I"), picks: [0], correct: true, attemptsUsed: 1 },
		{ item: item(["I", "IV", "V", "vi"], 1, "IV"), picks: [0, 1], correct: true, attemptsUsed: 2 },
		{ item: item(["I", "IV", "V", "vi"], 2, "V"), picks: [0, 1], correct: false, attemptsUsed: 2 },
		{ item: item(["I", "IV", "V", "vi"], 0, "I"), picks: [2], correct: false, attemptsUsed: 1 },
	];

	it("computes score and wrong percentages", () => {
		const s = summarizeTest(results);
		expect(s.total).toBe(4);
		expect(s.correct).toBe(2);
		expect(s.scorePct).toBe(50);
		expect(s.wrongPct).toBe(50);
	});
	it("lists missed items with the answer and the user's picks", () => {
		const s = summarizeTest(results);
		expect(s.missed).toHaveLength(2);
		expect(s.missed[0]).toEqual({ answer: "V", picked: ["I", "IV"] });
		expect(s.missed[1]).toEqual({ answer: "I", picked: ["V"] });
	});
	it("ranks per-answer accuracy weakest first", () => {
		const s = summarizeTest(results);
		// "I" appeared twice (1 right, 1 wrong = 50%), "IV" 100%, "V" 0% → V weakest.
		expect(s.perCategory[0].label).toBe("V");
		const i = s.perCategory.find((c) => c.label === "I");
		expect(i).toEqual({ label: "I", correct: 1, total: 2 });
	});
});

describe("ear-training questions", () => {
	it("quality mode: one root, distinct quality-name labels including the target", () => {
		for (let n = 0; n < 50; n++) {
			const q = makeQualityQuestion({ level: 2 });
			expect(q.options.length).toBeGreaterThanOrEqual(2);
			expect(new Set(q.labels).size).toBe(q.labels.length);
			expect(q.options[q.correctIndex]).toBe(q.target);
			expect(q.labels[q.correctIndex]).toBe(QUALITIES[q.target].name);
		}
	});

	it("function mode in a key labels options by Roman numeral", () => {
		for (let n = 0; n < 50; n++) {
			const q = makeQuestion({ level: 3, keyChoice: "C", tonality: "major", mode: "function" });
			expect(q.labels[q.correctIndex]).toBe(q.target.roman);
			expect(new Set(q.labels).size).toBe(q.labels.length);
		}
	});
});

describe("scales & chord tones", () => {
	it("maps qualities to sensible improv scales", () => {
		expect(scaleForChord("G", "7").name).toContain("Mixolydian");
		expect(scaleForChord("G", "7").notes).toEqual(["G", "A", "B", "C", "D", "E", "F"]);
		expect(scaleForChord("D", "m7").name).toContain("Dorian");
		expect(scaleForChord("C", "7alt").name).toContain("Altered");
		expect(scaleForChord("C", "maj7").name).toContain("Major");
	});

	it("chord tones are a subset of the chosen scale (diatonic qualities)", () => {
		for (const q of ["maj7", "m7", "7"] as const) {
			const scale = new Set(scaleForChord("C", q).notes);
			for (const tone of chordTones("C", q)) expect(scale.has(tone)).toBe(true);
		}
	});
});

describe("concert-pitch root for transposing playback", () => {
	it("matches the written root in concert (C), differs for Bb", () => {
		const concertChord = randomChord(2, "C", "major", "C");
		expect(concertChord.concertRoot).toBe(concertChord.root);
		// Eb concert tonic read by a Bb instrument is written F; concert stays Eb.
		const tonic = tonicChord("Eb", "major", 2, "Bb");
		expect(tonic.concertRoot).toBe("Eb");
		expect(tonic.root).toBe("F");
	});
});

describe("roman-numeral labels (key mode)", () => {
	it("labels chords by harmonic function in C major", () => {
		const roman = new Map<string, string>();
		for (let n = 0; n < 3000; n++) {
			const ch = randomChord(4, "C", "major");
			if (ch.roman) roman.set(ch.symbol, ch.roman);
		}
		expect(roman.get("G7")).toBe("V7");
		expect(roman.get("Dm7")).toBe("ii7");
		expect(roman.get("A7")).toBe("V7/ii"); // secondary dominant
		expect(roman.get("A♭maj7")).toBe("♭VImaj7"); // borrowed
	});

	it("chromatic 'all keys' chords carry no roman", () => {
		for (let n = 0; n < 100; n++) {
			expect(randomChord(4, "all", "major").roman).toBeUndefined();
		}
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

describe("jazz standards", () => {
	it("every standard resolves in all 12 keys with real roots and positive beats", () => {
		for (const std of STANDARDS) {
			const prog = standardToProgression(std);
			for (const key of KEYS) {
				const chords = expandProgression(prog, key);
				expect(chords.length).toBe(std.chords.length);
				for (const chord of chords) {
					expect(chord.root).toMatch(/^[A-G]/);
					expect(chord.beats).toBeGreaterThan(0);
				}
			}
		}
	});

	it("standardToProgression preserves chord count and total beats", () => {
		for (const std of STANDARDS) {
			const prog = standardToProgression(std);
			expect(prog.chords.length).toBe(std.chords.length);
			const beats = (cs: { beats: number }[]) => cs.reduce((a, c) => a + c.beats, 0);
			expect(beats(prog.chords)).toBe(beats(std.chords));
			expect(prog.defaultTonic).toBe(std.homeKey);
		}
	});
});

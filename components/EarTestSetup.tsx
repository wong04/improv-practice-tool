"use client";

import { usePersistentState } from "@/lib/storage/usePersistentState";
import { Level } from "@/lib/theory/chordPool";
import { LevelSelector } from "./LevelSelector";
import { Tonality } from "@/lib/theory/keyHarmony";
import { KeyTonalitySelector } from "./KeyTonalitySelector";
import { EarMode } from "@/lib/ear/earItem";
import { EarTestConfig } from "@/lib/ear/useEarTest";

const QUESTION_COUNTS = [5, 10, 20];
const ATTEMPTS = [1, 2, 3];
// The test offers the two chosen exercises.
const EXERCISES: [EarMode, string][] = [
	["quality", "Quality"],
	["degree", "Scale degree"],
];

/** Build/customise a test, then start it. */
export function EarTestSetup({ onStart }: { onStart: (config: EarTestConfig) => void }) {
	const [mode, setMode] = usePersistentState<EarMode>("earTestMode", "degree");
	const [level, setLevel] = usePersistentState<Level>("earTestLevel", 2);
	const [keyChoice, setKeyChoice] = usePersistentState<string | "all">("earTestKey", "C");
	const [tonality, setTonality] = usePersistentState<Tonality>("earTestTonality", "major");
	const [questionCount, setQuestionCount] = usePersistentState("earTestCount", 10);
	const [attempts, setAttempts] = usePersistentState("earTestAttempts", 2);
	const [revealOnWrong, setRevealOnWrong] = usePersistentState("earTestReveal", true);

	const keyMode = keyChoice !== "all";

	const start = () =>
		onStart({ mode, level, keyChoice, tonality, questionCount, attempts, revealOnWrong });

	return (
		<div className="flex w-full flex-col gap-5 rounded-2xl border border-white/10 bg-surface/50 p-5">
			<Field label="Exercise">
				<Pills
					options={EXERCISES}
					value={mode}
					onChange={(m) => setMode(m as EarMode)}
				/>
			</Field>

			<Field label="Difficulty">
				<LevelSelector value={level} onChange={setLevel} />
			</Field>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<Field label="Key">
					<KeyTonalitySelector
						keyChoice={keyChoice}
						onKeyChange={setKeyChoice}
						tonality={tonality}
						onTonalityChange={setTonality}
						allKeysLabel="All keys (random each)"
					/>
				</Field>

				<Field label="Questions">
					<Pills
						options={QUESTION_COUNTS.map((n) => [String(n), String(n)])}
						value={String(questionCount)}
						onChange={(v) => setQuestionCount(Number(v))}
					/>
				</Field>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<Field label="Attempts per question">
					<Pills
						options={ATTEMPTS.map((n) => [String(n), n === 1 ? "1" : `${n} tries`])}
						value={String(attempts)}
						onChange={(v) => setAttempts(Number(v))}
					/>
				</Field>

				<label className="flex items-center gap-2 self-end text-sm text-muted">
					<input
						type="checkbox"
						checked={revealOnWrong}
						onChange={(e) => setRevealOnWrong(e.target.checked)}
						className="h-4 w-4 accent-accent"
					/>
					Reveal answer when wrong
				</label>
			</div>

			<button
				type="button"
				onClick={start}
				className="min-h-[44px] self-center rounded-full bg-accent px-8 py-3 text-base font-semibold text-black transition hover:brightness-110"
			>
				Start test
			</button>
		</div>
	);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<label className="flex flex-col gap-1.5">
			<span className="text-sm text-muted">{label}</span>
			{children}
		</label>
	);
}

function Pills({
	options,
	value,
	onChange,
}: {
	options: [string, string][];
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<div className="inline-flex flex-wrap rounded-full border border-white/15 p-0.5">
			{options.map(([val, label]) => (
				<button
					key={val}
					type="button"
					onClick={() => onChange(val)}
					className={`min-h-[36px] rounded-full px-4 py-1.5 text-sm transition-colors ${
						value === val ? "bg-accent text-black" : "text-muted hover:text-foreground"
					}`}
				>
					{label}
				</button>
			))}
		</div>
	);
}

"use client";

import { usePersistentState } from "@/lib/storage/usePersistentState";
import { Level, TIERS } from "@/lib/theory/chordPool";
import { Tonality } from "@/lib/theory/keyHarmony";
import { KEYS } from "@/lib/theory/transpose";
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
				<div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
					{([1, 2, 3, 4] as Level[]).map((l) => (
						<button
							key={l}
							type="button"
							onClick={() => setLevel(l)}
							className={`rounded-lg px-2 py-2 text-center text-xs font-medium transition-colors ${
								level === l ? "bg-accent text-black" : "bg-white/5 text-muted hover:bg-white/10"
							}`}
						>
							{TIERS[l].name}
						</button>
					))}
				</div>
			</Field>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<Field label="Key">
					<select
						value={keyChoice}
						onChange={(e) => setKeyChoice(e.target.value)}
						className="w-full rounded-lg border border-white/15 bg-background px-2 py-1.5 text-sm"
					>
						<option value="all">All keys (random each)</option>
						{KEYS.map((k) => (
							<option key={k} value={k}>
								{k}
							</option>
						))}
					</select>
					{keyMode && (
						<div className="inline-flex rounded-full border border-white/15 p-0.5">
							{(["major", "minor"] as Tonality[]).map((t) => (
								<button
									key={t}
									type="button"
									onClick={() => setTonality(t)}
									className={`flex-1 rounded-full px-3 py-1 text-xs capitalize transition-colors ${
										tonality === t ? "bg-accent text-black" : "text-muted hover:text-foreground"
									}`}
								>
									{t}
								</button>
							))}
						</div>
					)}
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

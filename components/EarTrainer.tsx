"use client";

import { useState } from "react";
import { Level, TIERS } from "@/lib/theory/chordPool";
import { Tonality } from "@/lib/theory/keyHarmony";
import { KEYS } from "@/lib/theory/transpose";
import { EarMode } from "@/lib/ear/earItem";
import { useEarTrainer } from "@/lib/ear/useEarTrainer";
import { AudioControls, OptionGrid, RevealKeyboard } from "./EarOptions";
import { EarTest } from "./EarTest";

type EarView = "practice" | "test";

const PROMPT_LABEL: Record<EarMode, string> = {
	quality: "name the quality",
	function: "name the function",
	degree: "name the scale degree",
};

export function EarTrainer({
	active,
	mode,
	onModeChange,
	level,
	onLevelChange,
	keyChoice,
	onKeyChange,
	tonality,
	onTonalityChange,
}: {
	active: boolean;
	mode: EarMode;
	onModeChange: (mode: EarMode) => void;
	level: Level;
	onLevelChange: (level: Level) => void;
	keyChoice: string | "all";
	onKeyChange: (key: string | "all") => void;
	tonality: Tonality;
	onTonalityChange: (tonality: Tonality) => void;
}) {
	const [view, setView] = useState<EarView>("practice");
	const keyMode = keyChoice !== "all";

	const ear = useEarTrainer({
		level,
		keyChoice,
		tonality,
		mode,
		active: active && view === "practice",
	});

	const accuracy = ear.stats.total ? Math.round((ear.stats.correct / ear.stats.total) * 100) : null;

	return (
		<div className="flex w-full max-w-xl flex-col items-center gap-6">
			<div className="inline-flex rounded-full border border-white/10 bg-surface/50 p-1">
				<ViewButton activeView={view === "practice"} onClick={() => setView("practice")}>
					Practice
				</ViewButton>
				<ViewButton activeView={view === "test"} onClick={() => setView("test")}>
					Test
				</ViewButton>
			</div>

			{view === "test" ? (
				<EarTest active={active} />
			) : (
				<>
					<div className="flex items-center gap-6 text-sm text-muted">
						<span>
							Streak <span className="font-mono text-base text-foreground">{ear.streak}</span>
						</span>
						<span>
							Accuracy{" "}
							<span className="font-mono text-base text-foreground">
								{accuracy == null ? "—" : `${accuracy}%`}
							</span>
						</span>
						<span className="uppercase tracking-[0.2em]">{PROMPT_LABEL[mode]}</span>
					</div>

					<AudioControls
						revealed={ear.revealed}
						ready={ear.ready}
						onPlay={ear.play}
						onArpeggiate={ear.arpeggiate}
					/>

					{!ear.revealed && (
						<p className="text-xs text-muted/70">🎤 Sing the answer, then choose.</p>
					)}

					<OptionGrid
						labels={ear.labels}
						correctIndex={ear.correctIndex}
						picks={ear.pickedIndex == null ? [] : [ear.pickedIndex]}
						resolved={ear.revealed}
						onGuess={ear.guess}
					/>

					{ear.revealed && <RevealKeyboard notes={ear.item.revealNotes} />}

					{ear.revealed && (
						<button
							type="button"
							onClick={ear.next}
							className="min-h-[44px] rounded-full border border-white/20 px-6 py-2 text-sm font-medium text-foreground hover:border-accent"
						>
							Next →
						</button>
					)}

					<SettingsCard
						mode={mode}
						onModeChange={onModeChange}
						level={level}
						onLevelChange={onLevelChange}
						keyChoice={keyChoice}
						onKeyChange={onKeyChange}
						tonality={tonality}
						onTonalityChange={onTonalityChange}
						keyMode={keyMode}
					/>
				</>
			)}
		</div>
	);
}

function SettingsCard({
	mode,
	onModeChange,
	level,
	onLevelChange,
	keyChoice,
	onKeyChange,
	tonality,
	onTonalityChange,
	keyMode,
}: {
	mode: EarMode;
	onModeChange: (mode: EarMode) => void;
	level: Level;
	onLevelChange: (level: Level) => void;
	keyChoice: string | "all";
	onKeyChange: (key: string | "all") => void;
	tonality: Tonality;
	onTonalityChange: (tonality: Tonality) => void;
	keyMode: boolean;
}) {
	return (
		<div className="flex w-full flex-col gap-4 rounded-2xl border border-white/10 bg-surface/50 p-5">
			<div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
				{([1, 2, 3, 4] as Level[]).map((l) => (
					<button
						key={l}
						type="button"
						onClick={() => onLevelChange(l)}
						className={`rounded-lg px-2 py-2 text-center text-xs font-medium transition-colors ${
							level === l ? "bg-accent text-black" : "bg-white/5 text-muted hover:bg-white/10"
						}`}
					>
						{TIERS[l].name}
					</button>
				))}
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<label className="flex flex-col gap-1.5">
					<span className="text-sm text-muted">Key</span>
					<select
						value={keyChoice}
						onChange={(e) => onKeyChange(e.target.value)}
						className="w-full rounded-lg border border-white/15 bg-background px-2 py-1.5 text-sm"
					>
						<option value="all">All keys (chromatic)</option>
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
									onClick={() => onTonalityChange(t)}
									className={`flex-1 rounded-full px-3 py-1 text-xs capitalize transition-colors ${
										tonality === t ? "bg-accent text-black" : "text-muted hover:text-foreground"
									}`}
								>
									{t}
								</button>
							))}
						</div>
					)}
				</label>

				<label className="flex flex-col gap-1.5">
					<span className="text-sm text-muted">Identify</span>
					<div className="inline-flex rounded-full border border-white/15 p-0.5">
						<ModeButton active={mode === "quality"} onClick={() => onModeChange("quality")}>
							Quality
						</ModeButton>
						<ModeButton
							active={mode === "function"}
							disabled={!keyMode}
							onClick={() => onModeChange("function")}
						>
							Function
						</ModeButton>
						<ModeButton active={mode === "degree"} onClick={() => onModeChange("degree")}>
							Degree
						</ModeButton>
					</div>
					{!keyMode && mode === "function" && (
						<span className="text-xs text-muted/70">Pick a key to identify by function.</span>
					)}
				</label>
			</div>
		</div>
	);
}

function ViewButton({
	activeView,
	onClick,
	children,
}: {
	activeView: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${
				activeView ? "bg-accent text-black" : "text-muted hover:text-foreground"
			}`}
		>
			{children}
		</button>
	);
}

function ModeButton({
	active,
	disabled = false,
	onClick,
	children,
}: {
	active: boolean;
	disabled?: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={`flex-1 rounded-full px-3 py-1 text-sm transition-colors disabled:opacity-30 ${
				active ? "bg-accent text-black" : "text-muted hover:text-foreground"
			}`}
		>
			{children}
		</button>
	);
}

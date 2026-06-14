"use client";

import { Level, TIERS } from "@/lib/theory/chordPool";
import { INSTRUMENTS, Instrument, KEYS } from "@/lib/theory/transpose";

export type NextPreview = "auto" | "show" | "hide";

const BARS_OPTIONS = [1, 2, 4];

export function DrillControls({
	level,
	onLevelChange,
	keyChoice,
	onKeyChange,
	barsPerChord,
	onBarsChange,
	instrument,
	onInstrumentChange,
	nextPreview,
	onNextPreviewChange,
}: {
	level: Level;
	onLevelChange: (level: Level) => void;
	keyChoice: string | "all";
	onKeyChange: (key: string | "all") => void;
	barsPerChord: number;
	onBarsChange: (bars: number) => void;
	instrument: Instrument;
	onInstrumentChange: (instrument: Instrument) => void;
	nextPreview: NextPreview;
	onNextPreviewChange: (value: NextPreview) => void;
}) {
	return (
		<div className="flex w-full max-w-xl flex-col gap-5 rounded-2xl border border-foreground/10 p-5">
			<div className="flex flex-col gap-2">
				<span className="text-sm text-foreground/60">Difficulty</span>
				<div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
					{([1, 2, 3, 4] as Level[]).map((l) => (
						<button
							key={l}
							type="button"
							onClick={() => onLevelChange(l)}
							className={`rounded-lg px-2 py-2 text-center text-xs font-medium transition-colors ${
								level === l
									? "bg-foreground text-background"
									: "bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
							}`}
							title={TIERS[l].description}
						>
							{TIERS[l].name}
						</button>
					))}
				</div>
				<span className="text-xs text-foreground/45">{TIERS[level].description}</span>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<Field label="Key">
					<select
						value={keyChoice}
						onChange={(e) => onKeyChange(e.target.value)}
						className="w-full rounded-lg border border-foreground/15 bg-background px-2 py-1.5 text-sm"
					>
						<option value="all">All keys (random)</option>
						{KEYS.map((k) => (
							<option key={k} value={k}>
								{k}
							</option>
						))}
					</select>
				</Field>

				<Field label="Bars per chord">
					<div className="inline-flex rounded-full border border-foreground/15 p-0.5">
						{BARS_OPTIONS.map((b) => (
							<button
								key={b}
								type="button"
								onClick={() => onBarsChange(b)}
								className={`flex-1 rounded-full px-3 py-1 text-sm transition-colors ${
									barsPerChord === b
										? "bg-foreground text-background"
										: "text-foreground/60 hover:text-foreground"
								}`}
							>
								{b}
							</button>
						))}
					</div>
				</Field>

				<Field label="Read as">
					<select
						value={instrument}
						onChange={(e) => onInstrumentChange(e.target.value as Instrument)}
						className="w-full rounded-lg border border-foreground/15 bg-background px-2 py-1.5 text-sm"
					>
						{INSTRUMENTS.map((inst) => (
							<option key={inst.id} value={inst.id}>
								{inst.label}
							</option>
						))}
					</select>
				</Field>

				<Field label="Next chord">
					<select
						value={nextPreview}
						onChange={(e) => onNextPreviewChange(e.target.value as NextPreview)}
						className="w-full rounded-lg border border-foreground/15 bg-background px-2 py-1.5 text-sm"
					>
						<option value="auto">Auto (by difficulty)</option>
						<option value="show">Always show</option>
						<option value="hide">Always hide</option>
					</select>
				</Field>
			</div>
		</div>
	);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<label className="flex flex-col gap-1.5">
			<span className="text-sm text-foreground/60">{label}</span>
			{children}
		</label>
	);
}

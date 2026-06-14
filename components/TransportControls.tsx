"use client";

import { MetronomeIndicator } from "./MetronomeIndicator";

export const TIME_SIGNATURES: { label: string; beatsPerBar: number }[] = [
	{ label: "4/4", beatsPerBar: 4 },
	{ label: "3/4", beatsPerBar: 3 },
	{ label: "2/4", beatsPerBar: 2 },
	{ label: "6/8", beatsPerBar: 6 },
];

export const MIN_BPM = 30;
export const MAX_BPM = 300;

export function TransportControls({
	running,
	onToggle,
	bpm,
	onBpmChange,
	beatsPerBar,
	onBeatsPerBarChange,
	muted,
	onMutedChange,
	audioEnabled,
	onAudioEnabledChange,
	countIn,
	onCountInChange,
	beat,
	counting,
}: {
	running: boolean;
	onToggle: () => void;
	bpm: number;
	onBpmChange: (bpm: number) => void;
	beatsPerBar: number;
	onBeatsPerBarChange: (beats: number) => void;
	muted: boolean;
	onMutedChange: (muted: boolean) => void;
	audioEnabled: boolean;
	onAudioEnabledChange: (enabled: boolean) => void;
	countIn: boolean;
	onCountInChange: (enabled: boolean) => void;
	beat: number;
	counting: boolean;
}) {
	return (
		<div className="flex w-full max-w-xl flex-col gap-5 rounded-2xl border border-foreground/10 p-5">
			<div className="flex items-center justify-between gap-4">
				<button
					type="button"
					onClick={onToggle}
					className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
						running
							? "bg-foreground/10 text-foreground hover:bg-foreground/15"
							: "bg-foreground text-background hover:opacity-90"
					}`}
				>
					{running ? "Stop" : "Start"}
				</button>
				<MetronomeIndicator beatsPerBar={beatsPerBar} beat={beat} counting={counting} />
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => onAudioEnabledChange(!audioEnabled)}
						aria-pressed={audioEnabled}
						className={`rounded-full border px-3 py-2 text-sm transition-colors ${
							audioEnabled
								? "border-foreground/30 text-foreground"
								: "border-foreground/15 text-foreground/50 hover:text-foreground"
						}`}
						title={audioEnabled ? "Mute chord sounds" : "Play chord sounds"}
					>
						🎹 Chords
					</button>
					<button
						type="button"
						onClick={() => onMutedChange(!muted)}
						aria-pressed={muted}
						className="rounded-full border border-foreground/15 px-3 py-2 text-sm text-foreground/70 hover:text-foreground"
						title={muted ? "Unmute metronome" : "Mute metronome"}
					>
						{muted ? "🔇 Click" : "🔊 Click"}
					</button>
				</div>
			</div>

			<div className="flex items-center gap-3">
				<label className="w-24 shrink-0 text-sm text-foreground/60" htmlFor="tempo">
					Tempo
				</label>
				<input
					id="tempo"
					type="range"
					min={MIN_BPM}
					max={MAX_BPM}
					value={bpm}
					onChange={(e) => onBpmChange(Number(e.target.value))}
					className="flex-1 accent-foreground"
				/>
				<span className="w-16 text-right text-sm tabular-nums text-foreground/80">{bpm} bpm</span>
			</div>

			<div className="flex items-center gap-3">
				<span className="w-24 shrink-0 text-sm text-foreground/60">Time</span>
				<div className="inline-flex rounded-full border border-foreground/15 p-0.5">
					{TIME_SIGNATURES.map((ts) => (
						<button
							key={ts.label}
							type="button"
							onClick={() => onBeatsPerBarChange(ts.beatsPerBar)}
							className={`rounded-full px-3 py-1 text-sm transition-colors ${
								beatsPerBar === ts.beatsPerBar
									? "bg-foreground text-background"
									: "text-foreground/60 hover:text-foreground"
							}`}
						>
							{ts.label}
						</button>
					))}
				</div>
				<label className="ml-auto flex items-center gap-2 text-sm text-foreground/70">
					<input
						type="checkbox"
						checked={countIn}
						onChange={(e) => onCountInChange(e.target.checked)}
						className="h-4 w-4 accent-foreground"
					/>
					Count-in
				</label>
			</div>
		</div>
	);
}

"use client";

import { useRef, useState } from "react";
import { MetronomeIndicator } from "./MetronomeIndicator";

export const TIME_SIGNATURES: { label: string; beatsPerBar: number }[] = [
	{ label: "4/4", beatsPerBar: 4 },
	{ label: "3/4", beatsPerBar: 3 },
	{ label: "2/4", beatsPerBar: 2 },
	{ label: "6/8", beatsPerBar: 6 },
];

export const MIN_BPM = 30;
export const MAX_BPM = 300;

const clampBpm = (bpm: number) => Math.max(MIN_BPM, Math.min(MAX_BPM, bpm));

export type TransportProps = {
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
	clickVolume: number;
	onClickVolumeChange: (volume: number) => void;
	chordVolume: number;
	onChordVolumeChange: (volume: number) => void;
	beat: number;
	counting: boolean;
	/** Slim bar for focus mode. */
	compact?: boolean;
};

export function TransportControls(props: TransportProps) {
	const { running, onToggle, bpm, onBpmChange, beatsPerBar, beat, counting, compact } = props;

	const tapsRef = useRef<number[]>([]);
	const onTap = () => {
		const now = performance.now();
		const taps = tapsRef.current;
		// Reset if the last tap was a long time ago (new tempo).
		if (taps.length && now - taps[taps.length - 1] > 2000) taps.length = 0;
		taps.push(now);
		if (taps.length > 4) taps.shift();
		if (taps.length >= 2) {
			const intervals = taps.slice(1).map((t, i) => t - taps[i]);
			const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
			onBpmChange(clampBpm(Math.round(60000 / avg)));
		}
	};

	const startStop = (
		<button
			type="button"
			onClick={onToggle}
			className={`rounded-full px-7 py-2.5 text-sm font-semibold tracking-wide transition-colors ${
				running
					? "bg-surface text-foreground hover:bg-white/10"
					: "bg-accent text-black hover:brightness-110"
			}`}
		>
			{running ? "Stop" : "▸ Start"}
		</button>
	);

	if (compact) {
		return (
			<div className="flex w-full max-w-xl flex-wrap items-center justify-between gap-4 rounded-full border border-white/10 bg-surface/60 px-5 py-3 backdrop-blur">
				{startStop}
				<MetronomeIndicator beatsPerBar={beatsPerBar} beat={beat} counting={counting} />
				<div className="flex items-baseline gap-1.5">
					<BpmInput
						bpm={bpm}
						onBpmChange={onBpmChange}
						className="w-[2.6ch] bg-transparent text-center font-mono text-2xl tabular-nums caret-accent outline-none focus:text-accent"
					/>
					<span className="text-xs uppercase tracking-widest text-muted">bpm</span>
				</div>
				<div className="flex items-center gap-2">
					<IconToggle
						on={props.audioEnabled}
						onClick={() => props.onAudioEnabledChange(!props.audioEnabled)}
						label="🎹"
						title="Chord sounds"
					/>
					<IconToggle
						on={!props.muted}
						onClick={() => props.onMutedChange(!props.muted)}
						label={props.muted ? "🔇" : "🔊"}
						title="Metronome click"
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="flex w-full max-w-xl flex-col gap-6 rounded-3xl border border-white/10 bg-surface/50 p-6">
			{/* BPM hero */}
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div className="flex items-baseline gap-2">
					<BpmInput
						bpm={bpm}
						onBpmChange={onBpmChange}
						className="w-[2.6ch] bg-transparent text-center font-mono text-6xl leading-none tabular-nums caret-accent outline-none focus:text-accent"
					/>
					<span className="text-sm uppercase tracking-[0.2em] text-muted">bpm</span>
				</div>
				<div className="flex items-center gap-3">
					<MetronomeIndicator beatsPerBar={beatsPerBar} beat={beat} counting={counting} />
					<button
						type="button"
						onClick={onTap}
						className="rounded-full border border-white/15 px-4 py-2 text-sm text-muted transition-colors hover:text-foreground"
					>
						Tap
					</button>
				</div>
			</div>

			<input
				type="range"
				min={MIN_BPM}
				max={MAX_BPM}
				value={bpm}
				onChange={(e) => onBpmChange(Number(e.target.value))}
				aria-label="Tempo"
				className="w-full accent-accent"
			/>

			{/* Primary action + sound toggles */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				{startStop}
				<div className="flex items-center gap-2">
					<IconToggle
						on={props.audioEnabled}
						onClick={() => props.onAudioEnabledChange(!props.audioEnabled)}
						label="🎹 Chords"
						title="Play chord sounds"
					/>
					<IconToggle
						on={!props.muted}
						onClick={() => props.onMutedChange(!props.muted)}
						label={props.muted ? "🔇 Click" : "🔊 Click"}
						title="Metronome click"
					/>
				</div>
			</div>

			{/* Levels */}
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<VolumeSlider label="🔊 Click" value={props.clickVolume} onChange={props.onClickVolumeChange} />
				<VolumeSlider
					label="🎹 Chords"
					value={props.chordVolume}
					onChange={props.onChordVolumeChange}
					disabled={!props.audioEnabled}
				/>
			</div>

			{/* Meter + count-in */}
			<div className="flex flex-wrap items-center gap-3">
				<span className="w-20 shrink-0 text-sm text-muted">Time</span>
				<div className="inline-flex rounded-full border border-white/15 p-0.5">
					{TIME_SIGNATURES.map((ts) => (
						<button
							key={ts.label}
							type="button"
							onClick={() => props.onBeatsPerBarChange(ts.beatsPerBar)}
							className={`rounded-full px-3 py-1 text-sm transition-colors ${
								beatsPerBar === ts.beatsPerBar
									? "bg-accent text-black"
									: "text-muted hover:text-foreground"
							}`}
						>
							{ts.label}
						</button>
					))}
				</div>
				<label className="ml-auto flex items-center gap-2 text-sm text-muted">
					<input
						type="checkbox"
						checked={props.countIn}
						onChange={(e) => props.onCountInChange(e.target.checked)}
						className="h-4 w-4 accent-accent"
					/>
					Count-in
				</label>
			</div>
		</div>
	);
}

function BpmInput({
	bpm,
	onBpmChange,
	className,
}: {
	bpm: number;
	onBpmChange: (bpm: number) => void;
	className?: string;
}) {
	// While focused, hold a free-text draft so partial entries (e.g. "1" before "120")
	// aren't clamped mid-typing; commit + clamp on blur/Enter.
	const [draft, setDraft] = useState<string | null>(null);

	const commit = () => {
		const n = parseInt(draft ?? "", 10);
		if (!Number.isNaN(n)) onBpmChange(clampBpm(n));
		setDraft(null);
	};

	return (
		<input
			type="text"
			inputMode="numeric"
			value={draft ?? String(bpm)}
			onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
			onFocus={(e) => {
				setDraft(String(bpm));
				e.target.select();
			}}
			onBlur={commit}
			onKeyDown={(e) => {
				if (e.key === "Enter") {
					commit();
					e.currentTarget.blur();
				} else if (e.key === "Escape") {
					setDraft(null);
					e.currentTarget.blur();
				}
			}}
			aria-label="Tempo in BPM"
			className={className}
		/>
	);
}

function IconToggle({
	on,
	onClick,
	label,
	title,
}: {
	on: boolean;
	onClick: () => void;
	label: string;
	title: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={on}
			title={title}
			className={`rounded-full border px-3 py-2 text-sm transition-colors ${
				on
					? "border-accent/60 text-foreground"
					: "border-white/15 text-muted hover:text-foreground"
			}`}
		>
			{label}
		</button>
	);
}

function VolumeSlider({
	label,
	value,
	onChange,
	disabled = false,
}: {
	label: string;
	value: number;
	onChange: (value: number) => void;
	disabled?: boolean;
}) {
	return (
		<div className={`flex items-center gap-2 ${disabled ? "opacity-40" : ""}`}>
			<span className="w-16 shrink-0 text-sm text-muted">{label}</span>
			<input
				type="range"
				min={0}
				max={1}
				step={0.01}
				value={value}
				disabled={disabled}
				onChange={(e) => onChange(Number(e.target.value))}
				aria-label={`${label} volume`}
				className="flex-1 accent-accent"
			/>
			<span className="w-9 text-right font-mono text-sm tabular-nums text-foreground/80">
				{Math.round(value * 100)}
			</span>
		</div>
	);
}

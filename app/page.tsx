"use client";

import { useEffect } from "react";
import { usePersistentState } from "@/lib/storage/usePersistentState";
import { useMetronome } from "@/lib/audio/useMetronome";
import { useChordPlayer } from "@/lib/audio/useChordPlayer";
import { useDrill } from "@/lib/drill/useDrill";
import { usePattern, KeyCycle } from "@/lib/pattern/usePattern";
import { Level } from "@/lib/theory/chordPool";
import { Instrument } from "@/lib/theory/transpose";
import { PROGRESSIONS } from "@/lib/theory/progressions";
import { MAX_BPM, TransportControls } from "@/components/TransportControls";
import { ChordDisplay } from "@/components/ChordDisplay";
import { DrillControls, NextPreview } from "@/components/DrillControls";
import { PatternControls } from "@/components/PatternControls";
import { PatternChart } from "@/components/PatternChart";

type Mode = "drill" | "patterns";

export default function Home() {
	const [mode, setMode] = usePersistentState<Mode>("mode", "drill");

	// Shared / transport settings
	const [bpm, setBpm] = usePersistentState("bpm", 100);
	const [beatsPerBar, setBeatsPerBar] = usePersistentState("beatsPerBar", 4);
	const [muted, setMuted] = usePersistentState("muted", false);
	const [audioEnabled, setAudioEnabled] = usePersistentState("audioEnabled", false);
	const [countIn, setCountIn] = usePersistentState("countIn", false);
	const [instrument, setInstrument] = usePersistentState<Instrument>("instrument", "C");

	// Drill settings
	const [level, setLevel] = usePersistentState<Level>("level", 1);
	const [keyChoice, setKeyChoice] = usePersistentState<string | "all">("keyChoice", "all");
	const [barsPerChord, setBarsPerChord] = usePersistentState("barsPerChord", 2);
	const [nextPreview, setNextPreview] = usePersistentState<NextPreview>("nextPreview", "auto");

	// Pattern settings
	const [progressionId, setProgressionId] = usePersistentState("progressionId", PROGRESSIONS[0].id);
	const [keyCycle, setKeyCycle] = usePersistentState<KeyCycle>("keyCycle", "lock");
	const [tempoRamp, setTempoRamp] = usePersistentState("tempoRamp", false);
	const [rampStep, setRampStep] = usePersistentState("rampStep", 2);
	const progression = PROGRESSIONS.find((p) => p.id === progressionId) ?? PROGRESSIONS[0];

	const playChord = useChordPlayer(audioEnabled);
	const secondsPerBeat = 60 / bpm;

	const drill = useDrill({
		level,
		keyChoice,
		instrument,
		barsPerChord,
		onChordChange: (chord, time) =>
			playChord(chord.root, chord.quality, time, barsPerChord * beatsPerBar * secondsPerBeat),
	});
	const pattern = usePattern({
		progression,
		instrument,
		keyCycle,
		onRep: () => {
			if (tempoRamp) setBpm((b) => Math.min(MAX_BPM, b + rampStep));
		},
		onChordChange: (chord, time) =>
			playChord(chord.root, chord.quality, time, chord.beats * secondsPerBeat),
	});

	const metronome = useMetronome({
		bpm,
		beatsPerBar,
		countInBars: countIn ? 1 : 0,
		muted,
		onTick: mode === "drill" ? drill.onTick : pattern.onTick,
	});

	// Stop the transport when switching modes so the engines don't overlap.
	const { stop } = metronome;
	useEffect(() => {
		stop();
	}, [mode, stop]);

	const handleToggle = () => {
		if (metronome.running) {
			metronome.stop();
			return;
		}
		if (mode === "drill") drill.reset();
		else pattern.reset();
		void metronome.start();
	};

	const showNext = nextPreview === "show" || (nextPreview === "auto" && level <= 2);
	const activeChord = pattern.chords[pattern.activeIndex];

	return (
		<main className="flex flex-1 flex-col items-center gap-8 px-4 py-8">
			<header className="text-center">
				<h1 className="text-2xl font-semibold tracking-tight">Chord Thrower</h1>
				<p className="mt-1 text-sm text-foreground/60">Drill chords and jazz patterns in time.</p>
			</header>

			<nav className="inline-flex rounded-full border border-foreground/15 p-1">
				<TabButton active={mode === "drill"} onClick={() => setMode("drill")}>
					Drill
				</TabButton>
				<TabButton active={mode === "patterns"} onClick={() => setMode("patterns")}>
					Patterns
				</TabButton>
			</nav>

			{mode === "drill" ? (
				<>
					<ChordDisplay
						symbol={drill.current?.symbol ?? null}
						nextSymbol={drill.next?.symbol}
						showNext={showNext}
					/>
					<TransportControls
						running={metronome.running}
						onToggle={handleToggle}
						bpm={bpm}
						onBpmChange={setBpm}
						beatsPerBar={beatsPerBar}
						onBeatsPerBarChange={setBeatsPerBar}
						muted={muted}
						onMutedChange={setMuted}
						audioEnabled={audioEnabled}
						onAudioEnabledChange={setAudioEnabled}
						countIn={countIn}
						onCountInChange={setCountIn}
						beat={metronome.beat}
						counting={metronome.counting}
					/>
					<DrillControls
						level={level}
						onLevelChange={setLevel}
						keyChoice={keyChoice}
						onKeyChange={setKeyChoice}
						barsPerChord={barsPerChord}
						onBarsChange={setBarsPerChord}
						instrument={instrument}
						onInstrumentChange={setInstrument}
						nextPreview={nextPreview}
						onNextPreviewChange={setNextPreview}
					/>
				</>
			) : (
				<>
					<div className="flex flex-col items-center gap-1">
						<div className="text-6xl font-bold tracking-tight sm:text-7xl">
							{activeChord?.symbol ?? "—"}
						</div>
						<div className="text-sm text-foreground/45">key of {pattern.tonic}</div>
					</div>
					<PatternChart bars={pattern.bars} activeIndex={pattern.activeIndex} />
					<TransportControls
						running={metronome.running}
						onToggle={handleToggle}
						bpm={bpm}
						onBpmChange={setBpm}
						beatsPerBar={beatsPerBar}
						onBeatsPerBarChange={setBeatsPerBar}
						muted={muted}
						onMutedChange={setMuted}
						audioEnabled={audioEnabled}
						onAudioEnabledChange={setAudioEnabled}
						countIn={countIn}
						onCountInChange={setCountIn}
						beat={metronome.beat}
						counting={metronome.counting}
					/>
					<PatternControls
						progressionId={progressionId}
						onProgressionChange={setProgressionId}
						keyCycle={keyCycle}
						onKeyCycleChange={setKeyCycle}
						instrument={instrument}
						onInstrumentChange={setInstrument}
						tempoRamp={tempoRamp}
						onTempoRampChange={setTempoRamp}
						rampStep={rampStep}
						onRampStepChange={setRampStep}
					/>
				</>
			)}
		</main>
	);
}

function TabButton({
	active,
	onClick,
	children,
}: {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${
				active ? "bg-foreground text-background" : "text-foreground/60 hover:text-foreground"
			}`}
		>
			{children}
		</button>
	);
}

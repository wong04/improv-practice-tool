"use client";

import { useEffect, useRef, useState } from "react";
import { usePersistentState } from "@/lib/storage/usePersistentState";
import { useMetronome } from "@/lib/audio/useMetronome";
import { useChordPlayer } from "@/lib/audio/useChordPlayer";
import { useBass } from "@/lib/audio/useBass";
import { useRide } from "@/lib/audio/useRide";
import { useWakeLock } from "@/lib/audio/useWakeLock";
import { useRimClick } from "@/lib/audio/useRimClick";
import { bassNote, BassMode } from "@/lib/audio/bass";
import { Subdivision } from "@/lib/audio/metronome";
import { Voicing } from "@/lib/audio/chordPlayer";
import { useDrill } from "@/lib/drill/useDrill";
import { useDrillSettings } from "@/lib/drill/useDrillSettings";
import { usePattern } from "@/lib/pattern/usePattern";
import { usePatternSettings } from "@/lib/pattern/usePatternSettings";
import { useStandardsSettings } from "@/lib/standards/useStandardsSettings";
import { Instrument } from "@/lib/theory/transpose";
import { scaleForChord, chordTones } from "@/lib/theory/scales";
import { MAX_BPM, MIN_BPM, TransportControls } from "@/components/TransportControls";
import { Mixer, MixerProps } from "@/components/Mixer";
import { MixerSheet } from "@/components/MixerSheet";
import { ChordDisplay } from "@/components/ChordDisplay";
import { Keyboard } from "@/components/Keyboard";
import { DrillControls } from "@/components/DrillControls";
import { PatternControls } from "@/components/PatternControls";
import { PatternChart } from "@/components/PatternChart";
import { Standards } from "@/components/Standards";
import { EarTrainer } from "@/components/EarTrainer";
import { EarMode } from "@/lib/ear/earItem";

type Mode = "drill" | "patterns" | "ear" | "standards";

const clampBpm = (bpm: number) => Math.max(MIN_BPM, Math.min(MAX_BPM, bpm));

export default function Home() {
	const [mode, setMode] = usePersistentState<Mode>("mode", "drill");
	const [mixerOpen, setMixerOpen] = useState(false);

	// Shared / transport settings
	const [bpm, setBpm] = usePersistentState("bpm", 100);
	const [beatsPerBar, setBeatsPerBar] = usePersistentState("beatsPerBar", 4);
	const [muted, setMuted] = usePersistentState("muted", false);
	const [audioEnabled, setAudioEnabled] = usePersistentState("audioEnabled", false);
	const [countIn, setCountIn] = usePersistentState("countIn", false);
	const [instrument, setInstrument] = usePersistentState<Instrument>("instrument", "C");
	const [clickVolume, setClickVolume] = usePersistentState("clickVolume", 0.8);
	const [chordVolume, setChordVolume] = usePersistentState("chordVolume", 0.8);
	const [subdivision, setSubdivision] = usePersistentState<Subdivision>("subdivision", "none");
	const [backbeat, setBackbeat] = usePersistentState("backbeat", false);
	const [bassMode, setBassMode] = usePersistentState<BassMode>("bassMode", "off");
	const [bassVolume, setBassVolume] = usePersistentState("bassVolume", 0.85);
	const [rideVolume, setRideVolume] = usePersistentState("rideVolume", 0.7);
	const [voicing, setVoicing] = usePersistentState<Voicing>("voicing", "block");

	// Mode-specific settings (each hook manages its own persistence keys)
	const drillSettings = useDrillSettings();
	const patternSettings = usePatternSettings();
	const standardsSettings = useStandardsSettings();

	// Shared tempo ramp (used by both drill and pattern modes)
	const [tempoRamp, setTempoRamp] = usePersistentState("tempoRamp", false);
	const [rampStep, setRampStep] = usePersistentState("rampStep", 2);

	// Ear-training settings
	const [earMode, setEarMode] = usePersistentState<EarMode>("earMode", "quality");

	const { play: playChord, ready: chordsReady, loadError: chordsError } = useChordPlayer(audioEnabled, chordVolume, voicing);
	const { play: playBass, ready: bassReady, loadError: bassError } = useBass(bassMode !== "off", bassVolume);
	const { play: playRide, ready: rideReady, loadError: rideError } = useRide(subdivision !== "none", rideVolume, subdivision);
	const { play: playRimClick } = useRimClick(subdivision === "bossanova", rideVolume);
	const secondsPerBeat = 60 / bpm;

	const onBeat = (
		concertRoot: string,
		quality: Parameters<typeof bassNote>[0]["quality"],
		nextConcertRoot: string | undefined,
		beat: number,
		time: number,
	) => {
		const note = bassNote({
			mode: bassMode,
			root: concertRoot,
			quality,
			beat,
			beatsPerBar,
			nextRoot: nextConcertRoot,
		});
		if (note) playBass(note, time, secondsPerBeat);
	};

	const { level, setLevel, keyChoice, setKeyChoice, tonality, setTonality,
		showRoman, setShowRoman, showKeyboard, setShowKeyboard,
		barsPerChord, setBarsPerChord, nextPreview, setNextPreview } = drillSettings;
	const { progression, progressionId, setProgressionId, patternKey, setPatternKey,
		keyCycle, setKeyCycle } = patternSettings;
	const { standard, standardProg, standardKey, setStandardKey, standardId, selectStandard } = standardsSettings;

	const drill = useDrill({
		level,
		keyChoice,
		tonality,
		instrument,
		barsPerChord,
		onChordChange: (chord, time) =>
			playChord(chord.concertRoot, chord.quality, time, barsPerChord * beatsPerBar * secondsPerBeat),
		onBeat,
		onAdvance: () => {
			if (tempoRamp) setBpm((b) => Math.min(MAX_BPM, b + rampStep));
		},
	});
	const pattern = usePattern({
		progression,
		instrument,
		keyCycle,
		tonic: patternKey,
		onRep: () => {
			if (tempoRamp) setBpm((b) => Math.min(MAX_BPM, b + rampStep));
		},
		onChordChange: (chord, time) =>
			playChord(chord.concertRoot, chord.quality, time, chord.beats * secondsPerBeat),
		onBeat,
	});
	const standards = usePattern({
		progression: standardProg,
		instrument,
		keyCycle: "lock",
		tonic: standardKey,
		onChordChange: (chord, time) =>
			playChord(chord.concertRoot, chord.quality, time, chord.beats * secondsPerBeat),
		onBeat,
	});

	const activeEngine =
		mode === "drill" ? drill.onTick : mode === "patterns" ? pattern.onTick : mode === "standards" ? standards.onTick : undefined;
	const metronome = useMetronome({
		bpm,
		beatsPerBar,
		countInBars: countIn ? 1 : 0,
		muted,
		clickVolume,
		subdivision,
		backbeat,
		onTick: activeEngine,
		onRide: playRide,
		onRimClick: playRimClick,
	});

	const running = metronome.running;
	useWakeLock(running);

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
		else if (mode === "standards") standards.reset();
		else pattern.reset();
		void metronome.start();
	};

	// Keyboard shortcuts: Space = start/stop, ↑/↓ = tempo, F = fullscreen, Esc = exit fullscreen.
	const mainRef = useRef<HTMLElement>(null);
	const toggleRef = useRef(handleToggle);
	useEffect(() => {
		toggleRef.current = handleToggle;
	});
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const tag = (e.target as HTMLElement | null)?.tagName;
			if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
			if (e.code === "Space") {
				e.preventDefault();
				toggleRef.current();
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setBpm((b) => clampBpm(b + (e.shiftKey ? 5 : 1)));
			} else if (e.key === "ArrowDown") {
				e.preventDefault();
				setBpm((b) => clampBpm(b - (e.shiftKey ? 5 : 1)));
			} else if (e.key === "f" || e.key === "F") {
				if (document.fullscreenElement) void document.exitFullscreen();
				else void mainRef.current?.requestFullscreen?.();
			} else if (e.key === "Escape") {
				// The mixer sheet handles its own Esc (capture phase) and stops propagation,
				// so reaching here means no sheet is open — exit fullscreen if active.
				if (document.fullscreenElement) void document.exitFullscreen();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [setBpm]);

	const countdown = metronome.counting ? beatsPerBar - metronome.beat : null;

	const chordsLoading =
		(audioEnabled && !chordsReady) ||
		(bassMode !== "off" && !bassReady) ||
		(subdivision !== "none" && !rideReady);

	const audioLoadError =
		(audioEnabled && chordsError) ||
		(bassMode !== "off" && bassError) ||
		(subdivision !== "none" && rideError);

	const mixerProps: MixerProps = {
		muted,
		onMutedChange: setMuted,
		clickVolume,
		onClickVolumeChange: setClickVolume,
		beatsPerBar,
		backbeat,
		onBackbeatChange: setBackbeat,
		audioEnabled,
		onAudioEnabledChange: setAudioEnabled,
		chordVolume,
		onChordVolumeChange: setChordVolume,
		voicing,
		onVoicingChange: setVoicing,
		bassMode,
		onBassModeChange: setBassMode,
		bassVolume,
		onBassVolumeChange: setBassVolume,
		subdivision,
		onSubdivisionChange: setSubdivision,
		rideVolume,
		onRideVolumeChange: setRideVolume,
	};

	// Hero content per mode. Patterns + Standards share the chart-playing engine.
	const chartEngine = mode === "standards" ? standards : pattern;
	const chartActive = chartEngine.chords[chartEngine.activeIndex];
	const drillShowNext = nextPreview === "show" || (nextPreview === "auto" && level <= 2);
	let chartBar = 0;
	chartEngine.bars.forEach((b, i) => {
		if (chartEngine.activeIndex >= b.startIndex) chartBar = i;
	});

	const hero =
		mode === "drill" ? (
			<ChordDisplay
				symbol={drill.current?.symbol ?? null}
				nextSymbol={drill.next?.symbol}
				showNext={drillShowNext}
				countdown={countdown}
				focused={running}
				roman={drill.current?.roman}
				showRoman={showRoman && keyChoice !== "all"}
			/>
		) : (
			<div className="flex flex-col items-center gap-3">
				<ChordDisplay
					symbol={chartActive?.symbol ?? null}
					nextSymbol={chartEngine.chords[(chartEngine.activeIndex + 1) % (chartEngine.chords.length || 1)]?.symbol}
					showNext
					countdown={countdown}
					focused={running}
				/>
				<div className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
					{mode === "standards" ? `${standard.title} · ` : ""}key of {chartEngine.tonic} · bar{" "}
					{chartBar + 1}/{chartEngine.bars.length}
				</div>
			</div>
		);

	return (
		<main ref={mainRef} className="flex flex-1 flex-col items-center gap-8 bg-background px-4 py-8">
			{!running && (
				<header className="zone text-center">
					<h1 className="font-display text-3xl font-semibold tracking-tight">Chord Thrower</h1>
					<p className="mt-1 text-sm text-muted">Drill chords and jazz patterns in time.</p>
				</header>
			)}

			{!running && (
				<nav className="zone inline-flex rounded-full border border-white/10 bg-surface/50 p-1">
					<TabButton active={mode === "drill"} onClick={() => setMode("drill")}>
						Drill
					</TabButton>
					<TabButton active={mode === "patterns"} onClick={() => setMode("patterns")}>
						Patterns
					</TabButton>
					<TabButton active={mode === "standards"} onClick={() => setMode("standards")}>
						Standards
					</TabButton>
					<TabButton active={mode === "ear"} onClick={() => setMode("ear")}>
						Ear
					</TabButton>
				</nav>
			)}

			{mode === "ear" ? (
				<EarTrainer
					active={mode === "ear"}
					mode={earMode}
					onModeChange={setEarMode}
					level={level}
					onLevelChange={setLevel}
					keyChoice={keyChoice}
					onKeyChange={setKeyChoice}
					tonality={tonality}
					onTonalityChange={setTonality}
				/>
			) : (
				<>
					{hero}

					{mode === "drill" && showKeyboard && drill.current && !metronome.counting && (
						<div className="flex w-full max-w-xl flex-col items-center gap-2">
							<Keyboard
								chordTones={chordTones(drill.current.root, drill.current.quality)}
								scaleNotes={scaleForChord(drill.current.root, drill.current.quality).notes}
							/>
							<div className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
								{scaleForChord(drill.current.root, drill.current.quality).name}
							</div>
						</div>
					)}

					{(mode === "patterns" || mode === "standards") && !running && (
						<PatternChart
							bars={chartEngine.bars}
							activeIndex={chartEngine.activeIndex}
							sections={mode === "standards" ? standard.sections : undefined}
						/>
					)}

					<div className="zone w-full max-w-xl" style={{ animationDelay: "40ms" }}>
						<TransportControls
							running={running}
							onToggle={handleToggle}
							bpm={bpm}
							onBpmChange={setBpm}
							beatsPerBar={beatsPerBar}
							onBeatsPerBarChange={setBeatsPerBar}
							countIn={countIn}
							onCountInChange={setCountIn}
							beat={metronome.beat}
							counting={metronome.counting}
							chordsLoading={chordsLoading}
							compact={running}
							onOpenMixer={() => setMixerOpen(true)}
						/>
					</div>

					{audioLoadError && (
						<p className="text-xs text-amber-400/80">
							⚠ Some audio samples failed to load — check your connection and refresh.
						</p>
					)}

					{!running && (
						<div className="zone w-full max-w-xl" style={{ animationDelay: "100ms" }}>
							<Mixer {...mixerProps} />
						</div>
					)}

					{!running &&
						(mode === "standards" ? (
							<div className="zone w-full max-w-xl" style={{ animationDelay: "160ms" }}>
								<Standards
									standard={standard}
									selectedId={standardId}
									onSelect={selectStandard}
									standardKey={standardKey}
									onKeyChange={setStandardKey}
								/>
							</div>
						) : mode === "drill" ? (
							<div className="zone w-full max-w-xl" style={{ animationDelay: "160ms" }}>
								<DrillControls
									level={level}
									onLevelChange={setLevel}
									keyChoice={keyChoice}
									onKeyChange={setKeyChoice}
									tonality={tonality}
									onTonalityChange={setTonality}
									showRoman={showRoman}
									onShowRomanChange={setShowRoman}
									showKeyboard={showKeyboard}
									onShowKeyboardChange={setShowKeyboard}
									barsPerChord={barsPerChord}
									onBarsChange={setBarsPerChord}
									instrument={instrument}
									onInstrumentChange={setInstrument}
									nextPreview={nextPreview}
									onNextPreviewChange={setNextPreview}
									tempoRamp={tempoRamp}
									onTempoRampChange={setTempoRamp}
									rampStep={rampStep}
									onRampStepChange={setRampStep}
								/>
							</div>
						) : (
							<div className="zone w-full max-w-xl" style={{ animationDelay: "160ms" }}>
								<PatternControls
									progressionId={progressionId}
									onProgressionChange={setProgressionId}
									patternKey={patternKey}
									onPatternKeyChange={setPatternKey}
									keyCycle={keyCycle}
									onKeyCycleChange={setKeyCycle}
									instrument={instrument}
									onInstrumentChange={setInstrument}
									tempoRamp={tempoRamp}
									onTempoRampChange={setTempoRamp}
									rampStep={rampStep}
									onRampStepChange={setRampStep}
								/>
							</div>
						))}

					{!running && (
						<p className="text-xs text-muted/70">
							Space start/stop · ↑↓ tempo · F fullscreen · Esc exit
						</p>
					)}
				</>
			)}

			<MixerSheet open={mixerOpen} onClose={() => setMixerOpen(false)} mixer={mixerProps} />
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
				active ? "bg-accent text-black" : "text-muted hover:text-foreground"
			}`}
		>
			{children}
		</button>
	);
}

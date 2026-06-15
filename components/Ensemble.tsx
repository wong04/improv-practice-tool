"use client";

import { Subdivision } from "@/lib/audio/metronome";
import { BassMode } from "@/lib/audio/bass";
import { Voicing } from "@/lib/audio/chordPlayer";
import { IconToggle, Led, Segmented, VolumeSlider } from "./controls";

export type EnsembleProps = {
	muted: boolean;
	onMutedChange: (muted: boolean) => void;
	clickVolume: number;
	onClickVolumeChange: (volume: number) => void;
	backbeat: boolean;
	onBackbeatChange: (value: boolean) => void;
	audioEnabled: boolean;
	onAudioEnabledChange: (enabled: boolean) => void;
	chordVolume: number;
	onChordVolumeChange: (volume: number) => void;
	voicing: Voicing;
	onVoicingChange: (value: Voicing) => void;
	bassMode: BassMode;
	onBassModeChange: (value: BassMode) => void;
	bassVolume: number;
	onBassVolumeChange: (value: number) => void;
	subdivision: Subdivision;
	onSubdivisionChange: (value: Subdivision) => void;
	rideVolume: number;
	onRideVolumeChange: (value: number) => void;
};

/** The "band" as a mixing console: one channel strip per voice. */
export function Ensemble(props: EnsembleProps) {
	return (
		<div className="flex w-full max-w-xl flex-col rounded-2xl border border-white/10 bg-surface/50">
			<header className="flex items-center justify-between px-5 pt-4">
				<span className="font-mono text-xs uppercase tracking-[0.25em] text-muted">Ensemble</span>
			</header>

			<div className="flex flex-col divide-y divide-white/5 px-5 py-2">
				{/* Metronome */}
				<ChannelStrip
					icon="🥁"
					name="Metronome"
					active={!props.muted}
					toggle={
						<IconToggle
							on={!props.muted}
							onClick={() => props.onMutedChange(!props.muted)}
							label={props.muted ? "Muted" : "On"}
							title="Metronome click"
						/>
					}
					mode={
						<Segmented
							ariaLabel="Click accent"
							value={props.backbeat ? "backbeat" : "downbeat"}
							onChange={(v) => props.onBackbeatChange(v === "backbeat")}
							options={[
								["downbeat", "Downbeat"],
								["backbeat", "2 & 4"],
							]}
						/>
					}
					fader={
						<VolumeSlider
							label="Level"
							value={props.clickVolume}
							onChange={props.onClickVolumeChange}
							disabled={props.muted}
						/>
					}
				/>

				{/* Piano */}
				<ChannelStrip
					icon="🎹"
					name="Piano"
					active={props.audioEnabled}
					toggle={
						<IconToggle
							on={props.audioEnabled}
							onClick={() => props.onAudioEnabledChange(!props.audioEnabled)}
							label={props.audioEnabled ? "On" : "Off"}
							title="Play chord sounds"
						/>
					}
					mode={
						<Segmented
							ariaLabel="Voicing"
							value={props.voicing}
							onChange={props.onVoicingChange}
							options={[
								["block", "Block"],
								["shell", "Shell"],
								["rootless", "Rootless"],
							]}
						/>
					}
					fader={
						<VolumeSlider
							label="Level"
							value={props.chordVolume}
							onChange={props.onChordVolumeChange}
							disabled={!props.audioEnabled}
						/>
					}
				/>

				{/* Bass */}
				<ChannelStrip
					icon="🎸"
					name="Bass"
					active={props.bassMode !== "off"}
					mode={
						<Segmented
							ariaLabel="Bass mode"
							value={props.bassMode}
							onChange={props.onBassModeChange}
							options={[
								["off", "Off"],
								["roots", "Roots"],
								["walking", "Walking"],
							]}
						/>
					}
					fader={
						props.bassMode !== "off" ? (
							<VolumeSlider
								label="Level"
								value={props.bassVolume}
								onChange={props.onBassVolumeChange}
							/>
						) : null
					}
				/>

				{/* Ride */}
				<ChannelStrip
					icon="🔔"
					name="Ride"
					active={props.subdivision !== "none"}
					mode={
						<Segmented
							ariaLabel="Ride feel"
							value={props.subdivision}
							onChange={props.onSubdivisionChange}
							options={[
								["none", "Off"],
								["straight", "8ths"],
								["swing", "Swing"],
							]}
						/>
					}
					fader={
						props.subdivision !== "none" ? (
							<VolumeSlider
								label="Level"
								value={props.rideVolume}
								onChange={props.onRideVolumeChange}
							/>
						) : null
					}
				/>
			</div>
		</div>
	);
}

function ChannelStrip({
	icon,
	name,
	active,
	toggle,
	mode,
	fader,
}: {
	icon: string;
	name: string;
	active: boolean;
	toggle?: React.ReactNode;
	mode: React.ReactNode;
	fader: React.ReactNode;
}) {
	return (
		<div className={`flex flex-col gap-2.5 py-3 transition-opacity ${active ? "" : "opacity-40"}`}>
			<div className="flex items-center gap-2.5">
				<Led on={active} />
				<span className="text-base leading-none" aria-hidden>
					{icon}
				</span>
				<span className="font-display text-sm font-medium tracking-wide">{name}</span>
				{toggle && <div className="ml-auto">{toggle}</div>}
			</div>
			<div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 pl-[1.125rem]">
				<div className="shrink-0">{mode}</div>
				{fader && <div className="min-w-[12rem] flex-1">{fader}</div>}
			</div>
		</div>
	);
}

"use client";

import { useState } from "react";
import { Subdivision } from "@/lib/audio/metronome";
import { BassMode } from "@/lib/audio/bass";
import { Voicing } from "@/lib/audio/chordPlayer";
import { IconToggle, Led, Segmented, VolumeSlider } from "./controls";

export type MixerProps = {
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
export function Mixer(props: MixerProps) {
	// Remember the last active mode so the On toggle restores it (not always the default).
	const [lastBass, setLastBass] = useState<Exclude<BassMode, "off">>(
		props.bassMode !== "off" ? props.bassMode : "roots",
	);
	const [lastRide, setLastRide] = useState<Exclude<Subdivision, "none">>(
		props.subdivision !== "none" ? props.subdivision : "swing",
	);

	const bassOn = props.bassMode !== "off";
	const rideOn = props.subdivision !== "none";

	return (
		<div className="flex w-full max-w-xl flex-col rounded-2xl border border-white/10 bg-surface/50">
			<header className="flex items-center justify-between px-5 pt-4">
				<span className="font-mono text-xs uppercase tracking-[0.25em] text-muted">Mixer</span>
			</header>

			<div className="flex flex-col divide-y divide-white/5 px-5 py-2">
				{/* Metronome */}
				<ChannelStrip
					icon="🥁"
					name="Metronome"
					enabled={!props.muted}
					onToggle={() => props.onMutedChange(!props.muted)}
					mode={
						<Segmented
							ariaLabel="Click accent"
							disabled={props.muted}
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
					enabled={props.audioEnabled}
					onToggle={() => props.onAudioEnabledChange(!props.audioEnabled)}
					mode={
						<Segmented
							ariaLabel="Voicing"
							disabled={!props.audioEnabled}
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
					enabled={bassOn}
					onToggle={() => props.onBassModeChange(bassOn ? "off" : lastBass)}
					mode={
						<Segmented
							ariaLabel="Bass mode"
							disabled={!bassOn}
							value={bassOn ? (props.bassMode as Exclude<BassMode, "off">) : lastBass}
							onChange={(m) => {
								setLastBass(m);
								props.onBassModeChange(m);
							}}
							options={[
								["roots", "Roots"],
								["walking", "Walking"],
							]}
						/>
					}
					fader={
						<VolumeSlider
							label="Level"
							value={props.bassVolume}
							onChange={props.onBassVolumeChange}
							disabled={!bassOn}
						/>
					}
				/>

				{/* Ride */}
				<ChannelStrip
					icon="🔔"
					name="Ride"
					enabled={rideOn}
					onToggle={() => props.onSubdivisionChange(rideOn ? "none" : lastRide)}
					mode={
						<Segmented
							ariaLabel="Ride feel"
							disabled={!rideOn}
							value={rideOn ? (props.subdivision as Exclude<Subdivision, "none">) : lastRide}
							onChange={(m) => {
								setLastRide(m);
								props.onSubdivisionChange(m);
							}}
							options={[
								["straight", "Straight"],
								["swing", "Jazz"],
								["bossanova", "Bossa"],
							]}
						/>
					}
					fader={
						<VolumeSlider
							label="Level"
							value={props.rideVolume}
							onChange={props.onRideVolumeChange}
							disabled={!rideOn}
						/>
					}
				/>
			</div>
		</div>
	);
}

function ChannelStrip({
	icon,
	name,
	enabled,
	onToggle,
	mode,
	fader,
}: {
	icon: string;
	name: string;
	enabled: boolean;
	onToggle: () => void;
	mode: React.ReactNode;
	fader: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-2.5 py-3">
			<div className="flex items-center gap-2.5">
				<Led on={enabled} />
				<span className="text-base leading-none" aria-hidden>
					{icon}
				</span>
				<span className="font-display text-sm font-medium tracking-wide">{name}</span>
				<div className="ml-auto">
					<IconToggle on={enabled} onClick={onToggle} label={enabled ? "On" : "Off"} title={name} />
				</div>
			</div>
			<div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 pl-[1.125rem]">
				<div className="shrink-0">{mode}</div>
				<div className="min-w-[12rem] flex-1">{fader}</div>
			</div>
		</div>
	);
}

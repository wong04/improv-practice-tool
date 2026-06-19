"use client";

import { useState } from "react";
import { Subdivision } from "@/lib/audio/metronome";
import { BassMode } from "@/lib/audio/bass";
import { Voicing } from "@/lib/audio/chordPlayer";
import { Segmented, VolumeSlider } from "./controls";
import { ChannelStrip } from "./ChannelStrip";

export type MixerProps = {
	muted: boolean;
	onMutedChange: (muted: boolean) => void;
	clickVolume: number;
	onClickVolumeChange: (volume: number) => void;
	beatsPerBar: number;
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
							value={props.backbeat && props.beatsPerBar === 4 ? "backbeat" : "downbeat"}
							onChange={(v) => props.onBackbeatChange(v === "backbeat")}
							options={[
								["downbeat", "Downbeat"],
								...(props.beatsPerBar === 4 ? [["backbeat", "2 & 4"] as [string, string]] : []),
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


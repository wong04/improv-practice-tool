"use client";

import { Led } from "./controls";
import { IconToggle } from "./controls";

export function ChannelStrip({
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

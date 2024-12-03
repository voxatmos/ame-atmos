export interface ApiResponse<T> {
	data: Resource<T>[];
	resources: {
		albums: Record<string, Resource<Album>>;
	};
}

export interface Resource<T> {
	id: string;
	type: string;
	href: string;
	attributes: T;
	relationships: {
		artists: ApiResponse<Artist>;
		tracks: ApiResponse<Track>;
	};
}

export interface Storefront {
	name: string;
}

export interface Artist {
	name: string;
}

export interface Album {
	name: string;
	artistName: string;
	upc: string;
	trackCount: number;
	isComplete: boolean;
	releaseDate: string;
	copyright: string;
	recordLabel: string;
	isCompilation: boolean;
	isSingle: boolean;
	isMasteredForItunes: boolean;
	artwork: Artwork;
	audioTraits: string[];
}

export interface Track {
	artistName: string;
	name: string;
	isrc: string;
	trackNumber: number;
	discNumber: number;
	composerName: string;
	audioLocale: string;
	releaseDate: string;
	playParams?: object;
	hasLyrics: boolean;
	durationInMillis: number;
	genreNames: string[];
	hasTimeSyncedLyrics: boolean;
	extendedAssetUrls: {
		enhancedHls?: string;
		plus: string;
	};
	audioTraits: string[];

}

export interface Lyrics {
	ttml: string;
}

export interface Artwork {
	width: number;
	height: number;
	url: string;
}

declare global {

	interface Window {
		MusicKit: {
			getInstance(): MusicKit.Instance;
		}
	}

}

export namespace MusicKit {

	export interface Instance {
		readonly isAuthorized: boolean;
		readonly developerToken: string;
		readonly musicUserToken: string;
		addEventListener(type: "playbackStateDidChange", listener: (this: Instance, ev: PlaybackStateDidChangeEvent) => any, options?: boolean | AddEventListenerOptions): void;
		skipToNextItem(): Promise<void>;
	}

	interface PlaybackStateDidChangeEvent {
		readonly oldState: MusicKit.PlaybackStates;
		readonly state: MusicKit.PlaybackStates;
	}

	export enum PlaybackStates {
		none = 0,
		loading = 1,
		playing = 2,
		paused = 3,
		stopped = 4,
		ended = 5,
		seeking = 6,
		waiting = 8,
		stalled = 9,
		completed = 10
	}

}

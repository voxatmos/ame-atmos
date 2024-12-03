export interface Disc {
	offsets: number[];
	sectors: number;
}

export interface Track {
	length: number;
}

export interface Media {
	format: string;
	discs: Disc[];
	tracks: Track[];
}

export interface Release {
	media: Media[];
}

const eacArtistAlbumPattern = /\r?\n(.+?) \/ (.+?)\r?\n/;
const eacSectorPattern = / *\d+:\d+.\d+ *\| *\d+:\d+.\d+ *\| *(\d+) *\| *(\d+)/g;
const whipperArtistPattern = / Artist: (.+?)\r?\n/;
const whipperAlbumPattern = / Artist: (.+?)\r?\n/;
const whipperSectorPattern = / End sector: (\d+)/g;

export interface LogInfo {
	artist?: string
	album?: string
	toc?: string
}

export function parseLog(text: string): LogInfo | null {
	if (text.includes('Exact Audio Copy') || text.includes('X Lossless Decoder')) {
		const artistAlbumMatch = text.match(eacArtistAlbumPattern);

		return {
			artist: artistAlbumMatch?.[1],
			album: artistAlbumMatch?.[2],
			toc: Array.from(text.matchAll(eacSectorPattern), match => Number(match[2]) + 1).join(':') || undefined
		};
	} else if (text.includes('Log created by: whipper')) {
		const artistMatch = text.match(whipperArtistPattern);
		const albumMatch = text.match(whipperAlbumPattern);

		return {
			artist: artistMatch?.[1],
			album: albumMatch?.[1],
			toc: Array.from(text.matchAll(whipperSectorPattern), match => Number(match[1]) + 1).join(':') || undefined
		};
	} else {
		return null;
	}
}

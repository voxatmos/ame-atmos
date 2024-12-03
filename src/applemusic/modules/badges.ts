import { fromHTML, waitQuerySelector } from "../../common/dom";
import lossyBadge from "../assets/badges/lossy.svg?raw";
import admBadge from "../assets/badges/adm.svg?raw";
import atmosBadge from "../assets/badges/atmos.svg?raw";
import hiresLosslessBadge from "../assets/badges/hires-lossless.svg?raw";
import losslessBadge from "../assets/badges/lossless.svg?raw";
import spatialBadge from "../assets/badges/spatial.svg?raw";
import atmosSingleBadge from "../assets/badges/atmos-single.svg?raw"
import { onAlbumRoute } from "../glue/router";
import { getAlbum, getPageAlbumId } from "../services/album";

onAlbumRoute(async () => {
	const album = await getAlbum(getPageAlbumId());
	if (!album) return;

	const refEl = await waitQuerySelector(".headings__metadata-bottom");
	if (!refEl) return;

	const audioTraits = album.attributes.audioTraits;
	if (album.attributes.isMasteredForItunes) audioTraits.push("adm");

	const tracks = album.relationships.tracks.data;
    const SongTrait = [];
    tracks.forEach((track) => {
        if (track.type === "songs" && track.attributes && track.attributes.audioTraits) {
            SongTrait.push(...track.attributes.audioTraits);
        }
    });
	
	const containerEl = fromHTML<HTMLParagraphElement>(`<p class="ame-album-badges-container"></p>`);

	if (audioTraits.includes("lossy-stereo")) containerEl.insertAdjacentHTML("beforeend", lossyBadge);
	if (audioTraits.includes("lossless")) containerEl.insertAdjacentHTML("beforeend", losslessBadge);
	if (audioTraits.includes("hi-res-lossless")) containerEl.insertAdjacentHTML("beforeend", hiresLosslessBadge);
	if (audioTraits.includes("atmos")) containerEl.insertAdjacentHTML("beforeend", atmosBadge);
	if (audioTraits.includes("adm")) containerEl.insertAdjacentHTML("beforeend", admBadge);
	if (audioTraits.includes("spatial")) containerEl.insertAdjacentHTML("beforeend", spatialBadge);
	if (SongTraits.includes("atmos")) containerEl.insertAdjacentHTML("beforeend", atmosSingleBadge);

	refEl.after(containerEl);
});

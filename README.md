# Ame

Various userscripts for the music hoarding community.

# Ame VoxAtmos Edition

A special fork of the OG Ame to fast-pick Dolby Atmos Track from Apple Music.

## Getting Started

Install [ViolentMonkey](https://violentmonkey.github.io) or [TamperMonkey](https://tampermonkey.net) then proceed to installing any of the editions:

* [Apple Music](https://gitlab.com/dosolo/ame-atmos/-/raw/main/dist/applemusic.user.js)
* [MusicBrainz](https://gitlab.com/dosolo/ame-atmos/-/raw/main/dist/musicbrainz.user.js)
* [MusicBrainz - Works](https://gitlab.com/dosolo/ame-atmos/-/raw/main/dist/musicbrainz-works.user.js)
* [VGMdb](https://gitlab.com/dosolo/ame-atmos/-/raw/main/dist/vgmdb.user.js)

## Editions

Feature rundown for all editions of Ame.

### Ame (Apple Music)

* Selectable release title, artist, description.
* Fix preview queue not working when logged out.
* Check release storefront availability.
* Link to full resolution release cover.
* Hide upselling modals and banners.
* Extended release info panel.
* Fix CTRL+A in search field.
* Copy authorization token.
* Release quality badges.
* Check track quality.
* Lyrics downloading.
* Search MH Covers.

### Ame (MusicBrainz)

* Add covers directly from MH Covers.
* Batch download release scans.
* Enhanced search box:
  * Automatic focus on page load.
  * Search directly by ISRC, ISWC, CDTOC, Catalog Number, Barcode.
  * Search directly by EAC/XLD rip log.
  * Attach TOC from rip log on release page. (by pasting text into search box)
  * Attach ISRC from freeform text on release page. (by pasting text into search box)
* Related links:
  * Ongaku no Mori link on release page.
  * MH Covers link on release page.

### Ame (MusicBrainz - Works)

* Workflow for adding works to MusicBrainz using minc.or.jp, jasrac.or.jp and iswcnet.cisac.org.

### Ame (VGMdb)

* Seed release to MusicBrainz.
* Batch download album scans.
* Related links:
  * Ongaku no Mori link on release page.
  * MusicBrainz link on release page.

## References

Inspired by and/or used for reference:

* https://github.com/lisonge/vite-plugin-monkey
* https://github.com/chocolateboy/gm-compat
* https://gist.github.com/bunnykek/7f099f55fc558f398cb4cedf6c02c794
* https://github.com/ToadKing/apple-music-barcode-isrc
* https://github.com/ROpdebee/mb-userscripts/blob/main/mb_bulk_copy_work_codes.user.js

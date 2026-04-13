import AstalMpris from "gi://AstalMpris?version=0.1"
import { createState } from "ags"

export const mpris = AstalMpris.get_default()

export const [title, setTitle] = createState("")
export const [artist, setArtist] = createState("")
export const [coverArt, setCoverArt] = createState("")
export const [position, setPosition] = createState(0)
export const [length, setLength] = createState(0)
export const [isPlaying, setIsPlaying] = createState(false)
export const [hasPlayer, setHasPlayer] = createState(false)
export const [canGoNext, setCanGoNext] = createState(false)
export const [canGoPrevious, setCanGoPrevious] = createState(false)
export const [canSeek, setCanSeek] = createState(false)
export const [identity, setIdentity] = createState("")

export let activePlayer: AstalMpris.Player | undefined

function update() {
  const p = mpris.players.find((p) => p.available)
  activePlayer = p
  setTitle(p?.title || "")
  setArtist(p?.artist || "")
  setCoverArt(p?.coverArt || "")
  setPosition(p?.position || 0)
  setLength(p?.length || 0)
  setIsPlaying(p?.playbackStatus === AstalMpris.PlaybackStatus.PLAYING)
  setHasPlayer(!!p)
  setCanGoNext(p?.canGoNext || false)
  setCanGoPrevious(p?.canGoPrevious || false)
  setCanSeek(p?.canSeek || false)
  setIdentity(p?.identity || "")
}

function connectPlayer(p: AstalMpris.Player) {
  p.connect("notify::available", update)
  p.connect("notify::title", update)
  p.connect("notify::artist", update)
  p.connect("notify::cover-art", update)
  p.connect("notify::position", update)
  p.connect("notify::length", update)
  p.connect("notify::playback-status", update)
  p.connect("notify::can-go-next", update)
  p.connect("notify::can-go-previous", update)
  p.connect("notify::can-seek", update)
  p.connect("notify::identity", update)
}

mpris.players.forEach(connectPlayer)
mpris.connect("player-added", (_self, p: AstalMpris.Player) => {
  connectPlayer(p)
  update()
})
mpris.connect("player-closed", () => update())

update()

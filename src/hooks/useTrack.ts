import { useCallback, useEffect, useState } from "react"
import { DEFAULT_TRACK, TRACKS, type TrackId } from "@/data/resume"

const TRACK_IDS = Object.keys(TRACKS) as TrackId[]

export const isTrackId = (value: string | null): value is TrackId => value !== null && (TRACK_IDS as string[]).includes(value)

/** Pure, so it can be unit-tested without a DOM. */
export const readTrack = (search: string): TrackId => {
    const value = new URLSearchParams(search).get("track")
    return isTrackId(value) ? value : DEFAULT_TRACK
}

/**
 * The lens the page is read through, kept in the URL rather than in component
 * state. That way a link can be sent that already points at the right half of the
 * story, a reload does not lose the choice, and the back button behaves.
 *
 * Read straight off `location` instead of pulling in a router: this is a single
 * static page, and a router would be the largest dependency on the site.
 */
export const useTrack = (): [TrackId, (next: TrackId) => void] => {
    const [track, setTrack] = useState<TrackId>(() => readTrack(window.location.search))

    useEffect(() => {
        const onPopState = () => setTrack(readTrack(window.location.search))
        window.addEventListener("popstate", onPopState)
        return () => window.removeEventListener("popstate", onPopState)
    }, [])

    const select = useCallback((next: TrackId) => {
        const params = new URLSearchParams(window.location.search)
        params.set("track", next)
        window.history.pushState(null, "", `${window.location.pathname}?${params.toString()}${window.location.hash}`)
        setTrack(next)
    }, [])

    return [track, select]
}

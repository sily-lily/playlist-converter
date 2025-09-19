import { Color3 } from "./classes/RGB"

export type cache = {
    "translation": {
        "musicAppFrom": string,
        "musicAppTo": string
    },
    savedPlaylists: Array<any>,
    musicApps: Array<string>
}

export type settings = {
    textColor: {
        focused: string,
        unfocused: string
    },
    lineColor: {
        focused: string,
        unfocused: string
    }
}

export type drawable = {
    type: "frame" | "text",
    X: number,
    Y: number,
    frameWidth?: number,
    frameHeight?: number,
    text?: string,
    textColor?: Color3,
    lineColor?: Color3,
    isFocused?: boolean,
    unfocusedLineColor?: Color3
}
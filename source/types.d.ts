export type cache = {
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
    isFocused?: boolean
}
import * as readline from "readline";
import { listApps, listPlaylists } from "..";
import { Container } from "./Container";

class InputManager {
    constructor(public debug = false) {
        readline.emitKeypressEvents(process.stdin);
        if (process.stdin.isTTY) process.stdin.setRawMode(true);
        process.stdin.setEncoding("utf8");
        if (process.stdin.isTTY) process.stdin.resume();
        process.stdout.write("\x1b[?25l");
    }

    init(callback?: (pressed: string) => any) {
        const onKeypress = (str: string, key: any) => {
            if (!key) return;
            if (key.sequence === "\u0003") process.exit();
            let action: string | null = null;
            if (key.name === "up") action = "up";
            else if (key.name === "down") action = "down";
            else if (key.name === "left") action = "left";
            else if (key.name === "right") action = "right";
            else if (key.name === "escape") action = "escape";
            else if (key.name === "return" || key.name === "enter" || key.sequence === "\r" || key.sequence === "\n") action = "enter";
            else if (key.name === "space" || key.sequence === " ") action = "enter";
            if (this.debug) console.log({ str, name: key.name, seq: key.sequence, action });
            if (action && callback) callback(action);
        };
        (process.stdin as any).on("keypress", onKeypress);
    }
}

export function makeInputs(container: Container) {
    const inputManager = new InputManager(false);
    const options = ["Saved Playlists", "Available Apps", "Selection Menu"];
    const setFocus = (...names: string[]) => {
        options.forEach(o => container.focusObject(o, names.includes(o)));
    };

    container.redraw();
    container.serve();
    const transitions: Record<string, Record<string, () => void>> = {
        "Saved Playlists": {
            right: () => setFocus("Available Apps"),
            up: () => setFocus("Selection Menu"),
            enter: () => {
                listPlaylists();
                setFocus("Selection Menu");
            }
        },
        "Available Apps": {
            left: () => setFocus("Saved Playlists"),
            up: () => setFocus("Selection Menu"),
            enter: () => {
                listApps();
                setFocus("Selection Menu");
            }
        },
        "Selection Menu": {
            escape: () => {
                container.clearSelectionMenu();
                setFocus("Saved Playlists");
            },
            up: () => {

            },
            down: () => {
                if (container.fetchSelectionMenuIndex() === 0) setFocus("Saved Playlists");
            },
            left: () => container.selectPage(container.selectedPage - 1),
            right: () => container.selectPage(container.selectedPage + 1)
        }
    };

    inputManager.init((pressed: string) => {
        const focused = options.find(opt => container.isOptionFocused(opt));
        const action = focused && transitions[focused]?.[pressed];
        if (action) action();
        container.redraw();
        container.serve();
    });
}

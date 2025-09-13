import { listApps, listPlaylists } from "..";
import { Container } from "./Container";

class InputManager {
    constructor() {
        process.stdout.write("\x1b[?25l");
        process.stdin.setRawMode(true);
        process.stdin.setEncoding("utf-8");
    }

    init(callback?: (pressed: string) => any) {
        var buffer = "";
        process.stdin.on("data", (key) => {
            buffer += key;
            var action: string | null = null;
            if (buffer === "\u0003") process.exit();
            else if (buffer.startsWith("\u001B[")) {
                const code = buffer[2];
                if (code === "A") action = "up";
                if (code === "B") action = "down";
                if (code === "C") action = "right";
                if (code === "D") action = "left";
            } else if (buffer === "\u001B") action = "escape";
            if (action) {
                if (callback) callback(action);
                buffer = "";
            } else if (buffer.length > 3) {
                buffer = "";
            }
        });
    }
}

export function makeInputs(container: Container) {
    const inputManager = new InputManager();
    const setFocus = (...names: string[]) => {
        ["Saved Playlists", "Available Apps", "Selection Menu"].forEach(option => {
            container.focusObject(option, names.includes(option));
        });
    };

    const transitions: Record<string, Record<string, () => void>> = {
        "Saved Playlists": {
            right: () => {
                container.clearSelectionMenu();
                setFocus("Available Apps");
                listApps();
            },
            up: () => setFocus("Selection Menu")
        },
        "Available Apps": {
            left: () => {
                container.clearSelectionMenu();
                setFocus("Saved Playlists");
                listPlaylists();
            },
            up: () => setFocus("Selection Menu")
        },
        "Selection Menu": {
            escape: () => {
                container.clearSelectionMenu();
                setFocus("Saved Playlists");
            }
        }
    };

    inputManager.init((pressed: string) => {
        const focused = ["Saved Playlists", "Available Apps", "Selection Menu"].find(option => container.isOptionFocused(option));
        const action = focused && transitions[focused]?.[pressed];
        if (action) action();
        container.redraw();
        container.serve();
    });
}
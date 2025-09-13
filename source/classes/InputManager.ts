import { listApps, listPlaylists } from "..";
import { wait } from "../modules/miscellaneous";
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
    inputManager.init((pressed: string) => {
        if (container.isOptionFocused("Saved Playlists")) {
            if (pressed === "right") {
                container.focusObject("Saved Playlists", false);
                container.focusObject("Available Apps", true);
                container.focusObject("Selection Menu", false);
                listApps();
            } else if (pressed === "up") {
                container.focusObject("Saved Playlists", false);
                container.focusObject("Available Apps", false);
                container.focusObject("Selection Menu", true);
            }
        } else if (container.isOptionFocused("Available Apps")) {
            if (pressed === "left") {
                container.focusObject("Available Apps", false);
                container.focusObject("Selection Menu", false);
                container.focusObject("Saved Playlists", true);
                listPlaylists();
            } else if (pressed === "up") {
                container.focusObject("Available Apps", false);
                container.focusObject("Saved Playlists", false);
                container.focusObject("Selection Menu", true);
            }
        } else {
            if (pressed === "escape") {
                container.clearSelectionMenu();
                container.focusObject("Selection Menu", false);
                container.focusObject("Saved Playlists", true);
                container.focusObject("Available Apps", false);
            }
        }

        container.redraw();
        container.serve();
    });
}
import * as readline from "readline";
import { listApps, listPlaylists } from "..";
import { Container } from "./Container";

class InputManager {
    constructor() {
        readline.emitKeypressEvents(process.stdin);

        process.stdin.setRawMode(true);
        process.stdin.setEncoding("utf8");
        process.stdin.resume();
        process.stdout.write("\x1b[?25l");
    }

    init(
        callback?: (pressed: string) => any
    ) {
        const onPress = (__string: string, key: any) => {
            let action: string | null = null;
            if (!key) return;
            if (key.sequence === "\u0003") process.exit();
                 
                 if (key.name === "up") action = "up";
            else if (key.name === "down") action = "down";
            else if (key.name === "left") action = "left";
            else if (key.name === "right") action = "right";
            else if (key.name === "escape") action = "escape";
            else if (key.name === "return" || key.name === "enter" || key.sequence === "\r" || key.sequence === "\n") action = "enter";
            else if (key.name === "space" || key.sequence === " ") action = "enter";
        
            if (action && callback) callback(action);
        };

        process.stdin.on("keypress", onPress);
    }
}

export function makeBinds(
    main: Container
) {
    const manager = new InputManager();
    const choices = [
        "Saved Playlists",
        "Available Apps",
        "Selection Menu"
    ];

    const changeFocus = (...names: string[]) => {
        choices.forEach(choice => main.focusObject(choice, names.includes(choice)));
    }

    main.rescribble();
    main.serve();
    
    const transitions: Record<string, Record<string, () => void>> = {
        "Saved Playlists": {
            right: () => changeFocus("Available Apps"),
            up:    () => changeFocus("Selection Menu"),
            enter: () => {
                listPlaylists();
                changeFocus("Selection Menu");
            }
        },
        "Available Apps": {
            left:  () => changeFocus("Saved Playlists"),
            up:    () => changeFocus("Selection Menu"),
            enter: () => {
                listApps();
                changeFocus("Selection Menu");
            }
        },
        "Selection Menu": {
            escape: () => {
                main.clearSelectionMenu();
                changeFocus("Saved Playlists");
            },
            up:     () => {},
            down:   () => {
                if (main.fetchSelectionMenuIndex() === 0) changeFocus("Saved Playlists");
            },
            left:   () => main.choosePage(main.focusedPage - 1),
            right:  () => main.choosePage(main.focusedPage + 1)
        }
    }

    manager.init((pressed: string) => {
        const focused = choices.find(choice => main.isObjectFocused(choice));
        const action = focused && transitions[focused]?.[pressed];
        if (action) action();

        main.rescribble();
        main.serve();
    });
}
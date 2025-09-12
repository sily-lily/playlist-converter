export class InputManager {
    constructor() {
        process.stdin.setRawMode(true);
        process.stdin.setEncoding("utf-8");
    }

    init() {
        process.stdin.on("data", (key) => {
            const character = key.toString();
            this.keybinds(character);
        });
    }

    private keybinds(key: string) {
        if (key === "\u0003") {
            console.log("Thanks for using my playlist converter!! :3")
            process.exit();
        }
    }
}

/**
 * process.stdin.setRawMode(true);
process.stdin.setEncoding('utf8');

process.stdin.on("data", (key) => {
    const character = key.toString();
    if (character === '\u0003') {
        console.log('\nExiting.');
        process.exit();
    }
});
 */
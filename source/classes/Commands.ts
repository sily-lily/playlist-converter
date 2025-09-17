/**
 * 
 * TODO: Fix this mess of a class.. sometime..
 */
export class Commands {
    previousCommand: string;

    constructor() {
        this.previousCommand = "";
    }

    launch() {
        process.stdin.write("\n\n   ");
        const runCommand = (command: string) => this.handle(command);
        let command = "";

        process.stdin.setRawMode(false);
        process.stdin.on("data", function(input: string) {
            if (input.includes(":")) {
                command += input;
                if (input === ":q") process.exit(0);
            }
        });

        process.stdin.on("end", function() {
            runCommand(command);
        });
    }

    // [[<Command Name>, [<Param 1>, <Param 2>, ...]]]
    private commands: [[string, string[]]] = [
        ["help", ["-c", "-d"]]
    ]
    handle(
        command: string
    ) {
        let found = false;
        for (const localCommand of this.commands) {
            const commandName = localCommand[0];
            const params = localCommand[1];
            if (commandName.toLowerCase().includes(command.trim().toLowerCase())) {
                process.stdin.write(commandName + " | " + command);
                break;
            }
        }

        if (!found) process.stdin.write("Command not found! :(");
    }
}
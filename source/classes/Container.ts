import { fetchCacheData, fetchProjectVersion, fetchSettingsData } from "../modules/information";
import { Color3 } from "../modules/RGB";
import process from "node:process";

type drawable = {
    type: "frame" | "text",
    x: number,
    y: number,
    width?: number,
    height?: number,
    text?: string,
    color?: Color3,
    lineColor?: Color3,
    focused?: boolean
}

export class Container {
    sides = {
        horizontal:  "═",
        vertical:    "║",
        topRight:    "╗",
        bottomRight: "╝",
        topLeft:     "╔",
        bottomLeft:  "╚",
        topSplit:    "╦",
        bottomSplit: "╩",
        leftSplit:   "╠",
        rightSplit:  "╣",
        centerSplit: "╬"
    }

    maxPage: number;
    width: number;
    height: number;
    grid: string[][];
    objects: Map<string, drawable> = new Map();
    focusedOption: string;
    menuItems: Map<string, [string, number]> = new Map();
    cache: any[];
    selectedPage: number;

    constructor(width: number = 70, height: number = 21) {
        this.focusedOption = "";
        this.selectedPage = 1;
        this.cache = [];
        this.maxPage = 0;
        this.width = width;
        this.height = height;
        this.grid = Array.from({ length: height + 1 }, () => Array(width + 1).fill(" "));
        this.new(width, height, Color3.fromHex(fetchSettingsData().lineColor.unfocused), 0, 0, "Container", true);
    }

    // Drawing

    private draw(
        startRow: number, startCol: number,
        width: number, height: number,
        lineColor: Color3
    ) {
        const highestRow = startRow + height;
        const highestCol = startCol + width;
        for (var row = startRow; row <= highestRow; row++) {
            if (!this.grid[row]) {
                this.grid[row] = [];
            }

            if (this.grid[row]!.length <= highestCol) {
                const extra = highestCol - this.grid[row]!.length + 1;
                this.grid[row] = this.grid[row]!.concat(Array(extra).fill(" "));
            }

            for (var col = startCol; col <= highestCol; col++) {
                var frame = " ";
                if (row === startRow && col === startCol) frame = this.sides.topLeft;
                else if (row === startRow && col === highestCol) frame = this.sides.topRight;
                else if (row === highestRow && col === startCol) frame = this.sides.bottomLeft;
                else if (row === highestRow && col === highestCol) frame = this.sides.bottomRight;
                else if (row === startRow || row === highestRow) frame = this.sides.horizontal;
                else if (col === startCol || col === highestCol) frame = this.sides.vertical;
                this.grid[row]![col] = lineColor.toAnsi(frame);
            }
        }
    }

    new(
        width: number = 70, height: number = 21,
        lineColor: Color3,
        X: number = 0, Y: number = 0,
        name: string,
        isFocused: boolean,
        nodraw?: boolean
    ) {
        const startRow = Y % 2 === 0 && Y >= 1 ? Y / 2 : Y;
        this.objects.set(name, {
            type: "frame",
            x: X, y: startRow,
            width, height,
            lineColor,
            focused: isFocused
        });
        if (!nodraw) this.redraw();
    }

    write(
        text: string,
        X: number, Y: number,
        color: Color3,
        name: string,
        isFocused: boolean,
        nodraw?: boolean
    ) {
        this.objects.set(name, {
            type: "text",
            x: X, y: Y,
            text,
            color,
            focused: isFocused
        });
        if (!nodraw) this.redraw();
    }

    update(name: string, props: Partial<drawable>) {
        const obj = this.objects.get(name);
        if (!obj) return;
        Object.assign(obj, props);
        this.redraw();
    }

    delete(name: string, list: Map<string, any>) {
        switch (list) {
            case this.menuItems:
                this.menuItems.delete(name);
                return;
            case this.objects:
                this.objects.delete(name);
                return;
        }
        this.redraw();
    }

    private oldGrid: string[][] = [];
    redraw() {
        const newGrid: string[][] = Array.from({ length: this.height + 1 }, () => Array(this.width + 1).fill(" "));
        for (const obj of this.objects.values()) {
            if (obj.type === "frame") {
                this.drawToGrid(newGrid, obj.y, obj.x, obj.width!, obj.height!, obj.lineColor!);
            } else if (obj.type === "text" && obj.text) {
                for (var i = 0; i < obj.text.length; i++) {
                    const col = obj.x + i;
                    if (col >= this.width) break;
                    if (!newGrid[obj.y]) newGrid[obj.y] = Array(this.width + 1).fill(" ");
                    (newGrid[obj.y] as any)[col] = obj.color!.toAnsi(obj.text[i]!);
                }
                if (this.fetchSelectionMenuIndex() === 0) {
                    const writeOnLine = (text: string, color: Color3, line: number) => {
                        const row = line + 2;
                        const usableWidth = this.width - 2;
                        const start = Math.floor((usableWidth - text.length) / 2) + 1;
                        this.write(" " + text, start, row, color, `Default Message (${line})`, true, true);
                    }

                    // App information

                    // writeOnLine("⠀⠀⣠⡟⠀⠈⠙⢦⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⡶⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠾⠋⠁⠀⠈⢽⡄", Color3.fromHex(fetchSettingsData().textColor.focused), 1);
                    // writeOnLine("⠀⠀⡿⠀⠀⠀⠀⠀⠉⠷⣄⣀⣤⠤⠤⠤⠤⢤⣷⡀⠙⢷⡄⠀⠀⠀⠀⣠⠞⠉⠀⠀⠀⠀⠀⠈⡇", Color3.fromHex(fetchSettingsData().textColor.focused), 2);
                    // writeOnLine("⠀⢰⡇⠀⠀⠀⠀⠀⠀⠀⠉⠳⣄⠀⠀⠀⠀⠀⠈⠁⠀⠀⠹⣦⠀⣠⡞⠁⠀⠀⠀⠀⠀⠀⠀⠀⡗", Color3.fromHex(fetchSettingsData().textColor.focused), 3);
                    // writeOnLine("⠀⣾⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣻⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣏", Color3.fromHex(fetchSettingsData().textColor.focused), 4);
                    // writeOnLine("⠀⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⠂", Color3.fromHex(fetchSettingsData().textColor.focused), 5);
                    // writeOnLine("⠀⢿⠀⠀⠀⠀⣤⣤⣤⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣤⣤⣤⣤⡀⠀⠀⠀⠀⠀⣸⠇⠀", Color3.fromHex(fetchSettingsData().textColor.focused), 6);
                    // writeOnLine("⠀⠘⣇⠀⠀⠀⠀⠉⠉⠛⠛⢿⣶⣦⠀⠀⠀⠀⠀⠀⢴⣾⣟⣛⡋⠋⠉⠉⠁⠀⠀⠀⠀⣴⠏⠀⠀", Color3.fromHex(fetchSettingsData().textColor.focused), 7);
                    // writeOnLine("⢀⣀⠙⢷⡄⠀⠀⣀⣤⣶⣾⠿⠋⠁⠀⢴⠶⠶⠄⠀⠀⠉⠙⠻⠿⣿⣷⣶⡄⠀⠀⡴⠾⠛⠛⣹⠇", Color3.fromHex(fetchSettingsData().textColor.focused), 8);
                    // writeOnLine("⢸⡍⠉⠉⠉⠀⠀⠈⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⠀⠀⣬⠷⣆⣠⡤⠄⢀⣤⠞⠁⠀", Color3.fromHex(fetchSettingsData().textColor.focused), 9);
                    // writeOnLine("⠈⠻⣆⡀⠶⢻⣇⡴⠖⠀⠀⠀⣴⡀⣀⡴⠚⠳⠦⣤⣤⠾⠀⠀⠀⠀⠀⠘⠟⠋⠀⠀⠀⢻⣄⠀⠀", Color3.fromHex(fetchSettingsData().textColor.focused), 10);
                    // writeOnLine("⠀⢠⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⡀⠀⠀⢀⡇⠀⠀⠀⠀⠀⠀⠀⠀⣀⡿⠧⠿⠿⠟⠀⠀", Color3.fromHex(fetchSettingsData().textColor.focused), 11);
                    // writeOnLine("⠀⣾⡴⠖⠛⠳⢦⣿⣶⣄⣀⠀⠀⠀⠀⠘⢷⣀⠀⣸⠃⠀⠀⠀⣀⣀⣤⠶⠚⠉⠀⠀⠀⠀⠀⠀⠀", Color3.fromHex(fetchSettingsData().textColor.focused), 12);
                    // writeOnLine("⠀⠀⠀⠀⠀⠀⠀⠈⢷⡀⠈⠻⠦⠀⠀⠀⠀⠉⠉⠁⠀⠀⠀⠀⠹⣆⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", Color3.fromHex(fetchSettingsData().textColor.focused), 13);
                    // writeOnLine("⠀⠀⠀⠀⠀⠀⠀⢀⡴⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢳⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀", Color3.fromHex(fetchSettingsData().textColor.focused), 14);
                    
                    writeOnLine("Focus on the commandline using the keybind :          ", Color3.fromHex(fetchSettingsData().textColor.focused), 1);
                    writeOnLine("Get detailed help using :help -d and commands using -c", Color3.fromHex(fetchSettingsData().textColor.focused), 2);

                    writeOnLine("~~~~~", Color3.fromHex(fetchSettingsData().textColor.unfocused), 5);
                    writeOnLine("Use the arrow keys to navigate this menu        ", Color3.fromHex(fetchSettingsData().textColor.focused), 6);
                    writeOnLine("Use escape to clear and leave the Selection Menu", Color3.fromHex(fetchSettingsData().textColor.focused), 7);
                    writeOnLine("Use enter to press buttons or submit text fields", Color3.fromHex(fetchSettingsData().textColor.focused), 8);
                    writeOnLine("~~~~~", Color3.fromHex(fetchSettingsData().textColor.unfocused), 9);

                    writeOnLine(`Running on version: ${fetchProjectVersion()}                      `, Color3.fromHex(fetchSettingsData().textColor.unfocused), 12);
                    writeOnLine("github.com/sily-lily ~ lily.transgirls.win            ", Color3.fromHex("#5BCEFA"), 13);
                } else {
                    for (let index = 0; index <= 14; index++) {
                        this.objects.delete(`Default Message (${index})`);
                    }
                }
            }
        }

        this.grid = newGrid;
    }

    private drawToGrid(grid: string[][], startRow: number, startCol: number, width: number, height: number, lineColor: Color3) {
        const highestRow = startRow + height;
        const highestCol = startCol + width;
        for (var row = startRow; row <= highestRow; row++) {
            if (!grid[row]) grid[row] = [];
            if ((grid[row] as any[]).length <= highestCol) grid[row] = (grid[row] as any[]).concat(Array(highestCol - (grid[row] as any[]).length + 1).fill(" "));
            for (var col = startCol; col <= highestCol; col++) {
                var frame = " ";
                if (row === startRow && col === startCol) frame = this.sides.topLeft;
                else if (row === startRow && col === highestCol) frame = this.sides.topRight;
                else if (row === highestRow && col === startCol) frame = this.sides.bottomLeft;
                else if (row === highestRow && col === highestCol) frame = this.sides.bottomRight;
                else if (row === startRow || row === highestRow) frame = this.sides.horizontal;
                else if (col === startCol || col === highestCol) frame = this.sides.vertical;
                (grid[row] as any[])[col] = lineColor.toAnsi(frame);
            }
        }
    }

    serve() {
        var output = "";
        for (var r = 0; r <= this.height; r++) {
            for (var c = 0; c <= this.width; c++) {
                const newChar = (this.grid as any[])[r][c];
                if (newChar !== (this.oldGrid[r]?.[c] ?? " ")) {
                    output += `\x1b[${r + 1};${c + 1}H${newChar}`;
                }
            }
        }
        process.stdout.write(output);
        this.oldGrid = this.grid.map(row => [...row]);
    }

    // Object focusing

    isOptionFocused(name: string): boolean {
        return this.focusedOption.toLowerCase().replace(" Option", "").includes(name.toLowerCase().replace(" Option", ""));
    }

    focusObject(name: string, isFocused: boolean) {
        const lowerName = name.toLowerCase();
        var base = "Lily's Playlist Converter";
        if (isFocused) {
            this.focusedOption = name;
        } else if (this.focusedOption.toLowerCase().includes(lowerName)) {
            this.focusedOption = "";
        }

        var updateText = "";
        if (lowerName === "saved playlists") {
            updateText = isFocused ? `Your Saved Playlists (${fetchCacheData().savedPlaylists.length})` : "Unfocused - Your Saved Pla...";
        } else if (lowerName === "available apps") {
            updateText = isFocused ? `Available Apps (${fetchCacheData().musicApps.length})` : "Unfocused - Available Apps...";
        }

        this.update(`${name} Option`, {
            lineColor: Color3.fromHex(isFocused ? fetchSettingsData().lineColor.focused : fetchSettingsData().lineColor.unfocused),
            focused: isFocused
        });

        this.update(`${name} Title`, {
            text: updateText,
            color: Color3.fromHex(isFocused ? fetchSettingsData().textColor.focused : fetchSettingsData().textColor.unfocused),
            focused: isFocused
        });

        this.update("Selection Menu Title", {
            text: this.focusedOption.trim() !== "" ? `${base} (${this.focusedOption.replace(" Option", "")})` : `${base} (No menu selected)`
        });

        this.redraw();
    }

    // Selection Menu

    fetchSelectionMenuIndex(): number {
        var index = 0;
        for (const object of this.objects) {
            if (object[0].toLowerCase().includes("- selection menu")) index++;
        }
        return index;
    }

    newSelectionMenuItem(name: string = `Unknown Object ${this.fetchSelectionMenuIndex()} - Selection Menu`, isFocused: boolean) {
        var pageNumber = 1;
        if (this.menuItems.size !== 0) {
            let index = 0;
            this.menuItems.forEach((value, key) => {
                const pageNumber = Math.floor(index / 5) + 1;
                this.menuItems.set(key, [value[0], pageNumber]);
                index++;
            });
            this.maxPage = Math.ceil(this.menuItems.size / 5);
        }

        this.new(62, 2, Color3.fromHex(isFocused ? fetchSettingsData().lineColor.focused : fetchSettingsData().lineColor.unfocused), 4, 4 + this.fetchSelectionMenuIndex() * 6, !name.toLowerCase().includes("- selection menu") ? name + " - Selection Menu" : name, isFocused);
        this.write(name.replace(" - Selection Menu", ""), 6, this.fetchSelectionMenuIndex() * 3, Color3.fromHex(isFocused ? fetchSettingsData().textColor.focused : fetchSettingsData().textColor.unfocused), `${name} - Selection Title`, isFocused);
        this.menuItems.set(name, [name, pageNumber]);
    }

    selectPage(page: number) {
        if (this.fetchSelectionMenuIndex() === 0) return;
        if (this.fetchSelectionMenuIndex() !== 0) this.clearSelectionMenu();
        if (page > this.maxPage || page < 1) page = 1;
        this.selectedPage = page;
        this.update("Selection Menu Title", { text: `Lily's Playlist Converter (Page ${this.selectedPage} of ${this.maxPage})` });
        for (const [_, [name, pageNumber]] of this.menuItems) {
            if (pageNumber === this.selectedPage && !this.cache.includes(name)) {
                this.cache.push(name);
                this.newSelectionMenuItem(name, false);
            }
        }
    }

    clearSelectionMenu() {
        for (const object of this.objects) {
            if (object[0].toLowerCase().includes("- selection menu")) {
                this.delete(object[0], this.objects);
            } else if (object[0].toLowerCase().includes("- selection title")) {
                this.delete(object[0], this.objects);
            }
        }
        this.cache = [];
        this.menuItems.clear();
    }
}
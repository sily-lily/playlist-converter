import { fetchCacheData, fetchProjectVersion, fetchSettingsData, formatJSON } from "../data";
import { Color3 } from "./RGB";
import process from "node:process";
import path from "node:path";
import { cache, settings } from "../types";

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

    width: number;
    height: number;
    grid: string[][];
    objects: Map<string, drawable> = new Map();
    focusedOption: string;

    constructor(width: number = 70, height: number = 21) {
        this.focusedOption = "";
        this.width = width;
        this.height = height;
        this.grid = Array.from({ length: height + 1 }, () => Array(width + 1).fill(" "));
        this.new(width, height, Color3.fromHex(fetchSettingsData().lineColor.unfocused), 0, 0, "Container", true);
    }

    private bounds(row: number, col: number) {
        while (this.grid.length <= row) {
            this.grid.push(Array(this.width + 1).fill(" "));
        }

        if ((this.grid as any[])[0].length <= col) {
            for (let r = 0; r < this.grid.length; r++) {
                this.grid[r] = (this.grid as any[])[r].concat(
                    Array(col - (this.grid as any[])[r].length + 1).fill(" ")
                );
            }
            this.width = col;
        }
    }

    private draw(startRow: number, startCol: number, width: number, height: number, lineColor: Color3) {
        const highestRow = startRow + height;
        const highestCol = startCol + width;
        for (let row = startRow; row <= highestRow; row++) {
            this.bounds(row, highestCol);
            for (let col = startCol; col <= highestCol; col++) {
                let frame = " ";
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
        isFocused: boolean
    ) {
        const startRow = Y % 2 === 0 && Y >= 1 ? Y / 2 : Y;
        this.objects.set(name, {
            type: "frame",
            x: X, y: startRow,
            width, height,
            lineColor,
            focused: isFocused
        });
        this.redraw();
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

    delete(name: string) {
        this.objects.delete(name);
        this.redraw();
    }

    isOptionFocused(name: string): boolean {
        var isFocused = false;
        for (const object of this.objects) {
            if (this.focusedOption.toLowerCase().includes(name.toLowerCase())) {
                isFocused = object[1].focused as boolean;
            }
        }
        return isFocused;
    }

    focusObject(name: string, isFocused: boolean) {
        if (this.focusedOption.toLowerCase() !== name.toLowerCase()) {
            const base = `Lily's Playlist Converter [${fetchProjectVersion()}]`;
            var updateText = "";
            if (name.toLowerCase() === "saved playlists") {
                updateText = isFocused ? `Your Saved Playlists (${fetchCacheData().savedPlaylists})` : "Unfocused - Your Saved Pla...";
            } else if (name.toLowerCase() === "available apps") {
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

            this.focusedOption = isFocused ? `${name} Option` : this.focusedOption;
            this.update("Selection Menu Title", { text: this.focusedOption.trim() !== "" ? `${base} (${this.focusedOption.replace(" Option", "")})` : `${base} (No menu selected)` });
        }
    }

    private redraw() {
        this.grid = Array.from({ length: this.height + 1 }, () => Array(this.width + 1).fill(" "));
        for (const obj of this.objects.values()) {
            if (obj.type === "frame") {
                this.draw(obj.y, obj.x, obj.width!, obj.height!, obj.lineColor!);
            } else if (obj.type === "text") {
                if (!this.grid[obj.y]) this.grid[obj.y] = Array(this.width + 1).fill(" ");
                for (let index = 0; index < (obj.text ?? "").length; index++) {
                    const currentCol = obj.x + index;
                    if (currentCol >= this.width) break;
                    this.grid[obj.y]![currentCol] = obj.color!.toAnsi(obj.text![index]!);
                }
                if (this.fetchSelectionMenuIndex() === 0) {
                    this.write("  _  _  _       _", 4, 2, Color3.fromHex("#ffffff"), "Default Message (0)", true, true);
                    this.write(" | |(_)| |_   _( )  ___", 4, 3, Color3.fromHex("#ffffff"), "Default Message (1)", true, true);
                    this.write(" | || || | | | |/  / __|", 4, 4, Color3.fromHex("#ffffff"), "Default Message (2)", true, true);
                    this.write(" | || || | |_| |   \\__ \\", 4, 5, Color3.fromHex("#ffffff"), "Default Message (3)", true, true);
                    this.write(" |_||_||_|\\__, |   |___/", 4, 6, Color3.fromHex("#ffffff"), "Default Message (4)", true, true);
                    this.write("          |___/", 4, 7, Color3.fromHex("#ffffff"), "Default Message (5)", true, true);
                    this.write("        _             _ _     _                       ", 4, 8, Color3.fromHex("#ffffff"), "Default Message (6)", true, true);
                    this.write("  _ __ | | __ _ _   _| (_)___| |_    __ _ _ __  _ __  ", 4, 9, Color3.fromHex("#ffffff"), "Default Message (7)", true, true);
                    this.write(" | '_ \\| |/ _` | | | | | / __| __|  / _` | '_ \\| '_ \\ ", 4, 10, Color3.fromHex("#ffffff"), "Default Message (8)", true, true);
                    this.write(" | |_) | | (_| | |_| | | \\__ \\ |_  | (_| | |_) | |_) |", 4, 11, Color3.fromHex("#ffffff"), "Default Message (9)", true, true);
                    this.write(" | .__/|_|\\__,_|\\__, |_|_|___/\\__|  \\__,_| .__/| .__/ ", 4, 12, Color3.fromHex("#ffffff"), "Default Message (10)", true, true);
                    this.write(" |_|            |___/                    |_|   |_|    ", 4, 13, Color3.fromHex("#ffffff"), "Default Message (11)", true, true);
                } else {
                    for (let index = 0; index <= 14; index++) {
                        this.objects.delete(`Default Message (${index})`);
                    }
                }
            }
        }
    }

    serve(clear: boolean = true) {
        if (clear) process.stdout.write("\x1b[2J\x1b[0f");
        console.log(this.grid.map(row => row.join("")).join("\n") + "\n");
    }

    // Selection Menu

    fetchSelectionMenuIndex(): number {
        var index = 0;
        for (const object of this.objects) {
            if (object[0].toLowerCase().includes("- selection menu")) index += 1;
        }
        return index;
    }

    newSelectionMenuItem(name: string = `Unknown Object ${this.fetchSelectionMenuIndex()} - Selection Menu`, isFocused: boolean) {
        this.new(62, 2, Color3.fromHex(isFocused ? fetchSettingsData().lineColor.focused : fetchSettingsData().lineColor.unfocused), 4, 4 + this.fetchSelectionMenuIndex() * 6, !name.toLowerCase().includes("- selection menu") ? name + " - Selection Menu" : name, isFocused);
        this.write(name.replace(" - Selection Menu", ""), 6, this.fetchSelectionMenuIndex() * 3, Color3.fromHex(isFocused ? fetchSettingsData().textColor.focused : fetchSettingsData().textColor.unfocused), `${name} Title`, isFocused);
    }

    clearSelectionMenu() {
        for (const object of this.objects) {
            if (object[0].toLowerCase().includes("- selection menu")) {
                this.delete(object[0]);
            }
        }
    }
}
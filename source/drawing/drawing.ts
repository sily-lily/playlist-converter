import { Color3 } from "./RGB";
import process from "node:process";

function is4Multiple(input: number): boolean {
    return input % 4 === 0;
}

type Drawable = {
    type: "frame" | "text",
    x: number,
    y: number,
    width?: number,
    height?: number,
    text?: string,
    color?: Color3,
    lineColor?: Color3
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
    objects: Map<string, Drawable> = new Map();

    constructor(width: number = 76, height: number = 20) {
        this.width = width;
        this.height = height;
        this.grid = Array.from({ length: height + 1 }, () => Array(width + 1).fill(" "));
        this.new(width, height, Color3.fromHex("#4c3a50ff"), 0, 0, "Container");
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
        width: number = 76, height: number = 20,
        lineColor: Color3 = Color3.fromHex("#49364dff"),
        X: number = 0, Y: number = 0,
        name: string
    ) {
        const startRow = Y % 2 === 0 && Y >= 1 ? Y / 2 : Y;
        this.objects.set(name, { type: "frame", x: X, y: startRow, width, height, lineColor });
        this.redraw();
    }

    write(
        text: string,
        X: number, Y: number,
        color: Color3 = Color3.fromHex("#ffffff"),
        name: string
    ) {
        this.objects.set(name, { type: "text", x: X, y: Y, text, color });
        this.redraw();
    }

    update(name: string, props: Partial<Drawable>) {
        const obj = this.objects.get(name);
        if (!obj) return;
        Object.assign(obj, props);
        this.redraw();
    }

    delete(name: string) {
        this.objects.delete(name);
        this.redraw();
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
            console.log(object[0])
            if (object[0].toLowerCase().includes("- selection menu")) index += 1;
        }
        return index;
    }

    //     newSelectionMenuItem(name: string = `Unknown Object Option ${this.fetchSelectionMenuIndex()} - Selection Menu`) {
    //     const height = 4 + this.fetchSelectionMenuIndex() + 6;
    //     this.new(62, 2, Color3.fromHex("#4c3a50ff"), 4, height, !name.toLowerCase().includes("- selection menu") ? name + " - Selection Menu" : name);
    //     this.write(name, 4, 4, Color3.fromRGB(180, 180, 180), `${name} Title`);
    // }

    newSelectionMenuItem(name: string = `Unknown Object ${this.fetchSelectionMenuIndex()} - Selection Menu`) {
        this.new(62, 2, Color3.fromHex("#4c3a50ff"), 4, 4 + this.fetchSelectionMenuIndex() * 6, !name.toLowerCase().includes("- selection menu") ? name + " - Selection Menu" : name);
    }

    clearSelectionMenu() {
        for (const object of this.objects) {
            if (object[0].toLowerCase().includes("- selection menu")) {
                this.delete(object[0]);
            }
        }
    }
}
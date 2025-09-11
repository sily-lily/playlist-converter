import { Color3 } from "./RGB";
import process from "node:process";

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
        if (clear) process.stdout.write("\x1b[2J\x1b[0f"); // clear + reset cursor
        console.log(this.grid.map(row => row.join("")).join("\n") + "\n");
    }
}
import { Color3 } from "./RGB"

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

    constructor(width: number = 76, height: number = 20) {
        this.width = width;
        this.height = height;
        this.grid = Array.from({ length: height + 1 }, () => Array(width + 1).fill(" "));
        this.new(width, height);
    }

    draw(
        startRow: number, startCol: number,
        width: number, height: number,
        lineColor: Color3 = Color3.fromHex("#49364dff")
    ) {
        const highestRow = startRow + height;
        const highestCol = startCol + width;
        while (this.grid.length <= highestRow) {
            this.grid.push(Array(this.width + 1).fill(" "));
        }

        if ((this.grid as any[])[0].length <= highestCol) {
            for (let r = 0; r < this.grid.length; r++) {
                this.grid[r] = (this.grid as any[])[r].concat(
                    Array(highestCol - (this.grid as any[])[r].length + 1).fill(" ")
                );
            }
            this.width = highestCol;
        }

        for (let row = startRow; row <= highestRow; row++) {
            if (!this.grid[row]) this.grid[row] = Array(this.width + 1).fill(" ");
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
        X: number = 0, Y: number = 0
    ) {
        const startRow = Y % 2 === 0 && Y >= 1 ? Y / 2 : Y;
        this.draw(startRow, X, width, height, lineColor);
    }

    write(
        text: string,
        X: number, Y: number,
        color: Color3 = Color3.fromHex("#ffffff")
    ) {
        if (!this.grid[Y]) this.grid[Y] = Array(this.width + 1).fill(" ");
        for (let index = 0; index < text.length; index++) {
            const currentCol = X + index;
            if (currentCol >= this.width) break;
            this.grid[Y]![currentCol] = color.toAnsi(text[index]!);
        }
    }

    serve() {
        console.log(this.grid.map(row => row.join("")).join("\n") + "\n");
    }
}
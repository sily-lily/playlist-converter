import { fetchCacheData, fetchProjectVersion, fetchSettingsData } from "../modules/information";
import { Color3 } from "./RGB";
import { drawable } from "../types";

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

    inputValues: Map<string, string>;
    pageItems: Map<string, [string, number, string, (pressed: string, key?: any) => any, string?]>;
    highestPage: number;
    focusedPage: number;
    focusedSelectionItem: string;
    focusedSelectionItemIndex: number;

    frameWidth: number;
    frameHeight: number;

    grid: string[][];
    cache: any[];

    objects: Map<string, drawable>;
    focusedObject: string;

    constructor(
        frameWidth: number = 70, frameHeight: number = 21,
        name: string
    ) {
        this.inputValues = new Map();
        this.pageItems = new Map();
        this.highestPage = 0;
        this.focusedPage = 1;
        this.focusedSelectionItem = "";
        this.focusedSelectionItemIndex = 0;

        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;

        this.grid = Array.from({ length: frameHeight + 1 }, () => Array(frameWidth + 1).fill(" "));
        this.cache = [];

        this.objects = new Map();
        this.focusedObject = "";

        // Main object (What everything else goes inside) :3

        this.makeFrame("Main" + name, frameWidth, frameHeight, 0, 0, Color3.fromHex(fetchSettingsData().lineColor.unfocused), false, true);
    }

    // Drawing stuff

    makeFrame(
        name: string,
        frameWidth: number = 70, frameHeight: number = 21,
        X: number = 0, Y: number = 0,
        lineColor: Color3,
        isFocused: boolean,
        avoidDrawing?: boolean
    ) {
        const beginningRow = Y % 2 === 0 && Y >= 1 ? Y / 2 : Y;
        this.objects.set(name, {
            type: "frame",
            X, Y: beginningRow,
            frameWidth, frameHeight,
            lineColor,
            isFocused
        }); 
        if (!avoidDrawing) this.rescribble();
    }

    makeLabel(
        name: string, text: string,
        X: number, Y: number,
        textColor: Color3,
        isFocused: boolean,
        avoidDrawing?: boolean
    ) {
        this.objects.set(name, {
            type: "text",
            X, Y,
            text, textColor,
            isFocused,
            fullText: name.replace(" - Selection Title", "")
        });
        if (!avoidDrawing) this.rescribble();
    }

    modify(
        name: string,
        properties: Partial<drawable>
    ) {
        const object = this.objects.get(name);
        if (!object) return;
        
        Object.assign(object, properties);
        this.rescribble();
    }

    remove(
        name: string,
        object: Map<string, any>
    ) {
        object.delete(name);
        this.rescribble();
    }

    fetchProperties(
        name: string
    ) {
        return this.objects.get(name);
    }

    private previousGrid: string[][] = [];
    rescribble() {
        const newGrid: string[][] = Array.from({ length: this.frameHeight + 1 }, () => Array(this.frameWidth + 1).fill(" "));
        for (const object of this.objects.values()) {
            if (object.type === "frame") {
                this.drawOnGrid(newGrid, object.Y, object.X, object.frameWidth!, object.frameHeight!, object.lineColor!);
            } else if (object.type === "text" && object.text) {
                for (let index = 0; index < object.text.length; index++) {
                    const column = object.X + index;
                    if (column >= this.frameWidth) break;
                    if (!newGrid[object.Y]) newGrid[object.Y] = Array(this.frameWidth + 1).fill(" ");
                    newGrid[object.Y]![column] = object.textColor!.toAnsi(object.text[index]!);
                }

                if (this.fetchSelectionMenuIndex() === 0) {
                    const scribbleLine = (
                        text: string, textColor: Color3,
                        lineNumber: number
                    ) => {
                        const beginning = Math.floor(((this.frameWidth - 2) - text.length) / 2) + 1;
                        this.makeLabel(`Default Message (${lineNumber})`, " " + text, beginning, lineNumber + 2, textColor, false, true);
                    }

                    scribbleLine("Optionally support me on PayPal or Ko-Fi :3           ", Color3.fromHex(fetchSettingsData().textColor.focused), 1);
                    scribbleLine("Press space to select an app from, enter to select to",  Color3.fromHex(fetchSettingsData().textColor.focused), 2);

                    scribbleLine("~~~~~",                                            Color3.fromHex(fetchSettingsData().textColor.unfocused), 5);
                    scribbleLine("Use space to toggle, enter to make a new playlist", Color3.fromHex(fetchSettingsData().textColor.focused), 6);
                    scribbleLine("Use escape to clear and leave the Selection Menu ", Color3.fromHex(fetchSettingsData().textColor.focused), 7);
                    scribbleLine("Use enter to press buttons or submit text fields ", Color3.fromHex(fetchSettingsData().textColor.focused), 8);
                    scribbleLine("~~~~~",                                            Color3.fromHex(fetchSettingsData().textColor.unfocused), 9);

                    scribbleLine(`Running on version: ${fetchProjectVersion()}                      `, Color3.fromHex(fetchSettingsData().textColor.unfocused), 12);
                    scribbleLine("github.com/sily-lily ~ lily.transgirls.win            ",             Color3.fromHex("#5BCEFA"), 13);
                } else {
                    for (let index = 0; index <= 14; index++) {
                        this.objects.delete(`Default Message (${index})`);
                    }
                }
            }
        }

        this.grid = newGrid;
    }

    private drawOnGrid(
        grid: string[][],
        beginningRow: number, beginningColumn: number,
        frameWidth: number, frameHeight: number,
        lineColor: Color3
    ) {
        const highestRow = beginningRow + frameHeight;
        const highestColumn = beginningColumn + frameWidth;
        for (let row = beginningRow; row <= highestRow; row++) {
            if (!grid[row]) grid[row] = [];
            if (grid[row]!.length <= highestColumn) grid[row] = grid[row]!.concat(Array(highestColumn - grid[row]!.length + 1).fill(" "));
            for (let column = beginningColumn; column <= highestColumn; column++) {
                let frame = " ";
                     if (row    === beginningRow    && column === beginningColumn) frame = this.sides.topLeft;
                else if (row    === beginningRow    && column === highestColumn)   frame = this.sides.topRight;
                else if (row    === highestRow      && column === beginningColumn) frame = this.sides.bottomLeft;
                else if (row    === highestRow      && column === highestColumn)   frame = this.sides.bottomRight;
                else if (row    === beginningRow    || row    === highestRow)      frame = this.sides.horizontal;
                else if (column === beginningColumn || column === highestColumn)   frame = this.sides.vertical;
                grid[row]![column] = lineColor.toAnsi(frame);
            }
        }
    }

    serve() {
        let main = "";
        for (let row = 0; row <= this.frameHeight; row++) {
            for (let column = 0; column <= this.frameWidth; column++) {
                const character = this.grid[row]![column];
                if (character !== (this.previousGrid[row]?.[column] ?? " ")) {
                    main += `\x1b[${row + 1};${column + 1}H${character}`;
                }
            }
        }

        process.stdout.write(main);
        this.previousGrid = this.grid.map(row => [...row]);
    }

    // Object focusing

    isObjectFocused(
        name: string
    ): boolean {
        return this.focusedObject.toLowerCase().replace(" Option", "").includes(name.toLowerCase().replace(" Option", "")) || this.focusedSelectionItem.toLowerCase().includes(name.toLowerCase());
    }

    focusObject(
        name: string,
        isFocused: boolean,
        isSelectionItem: boolean,
        isInput?: boolean
    ) {
        const base = "Lily's Playlist Conversion Tool";
             if (isFocused && !isSelectionItem) this.focusedObject = name;
        else if (this.focusedObject.toLowerCase().includes(name.toLowerCase()) && !isSelectionItem) this.focusedObject = "";
        let titleText = "";
             if (name.toLowerCase() === "saved playlists") titleText = isFocused ? `Your Saved Playlists (${fetchCacheData().savedPlaylists.length})` : "Unfocused - Your Saved Pla...";
        else if (name.toLowerCase() === "available apps")  titleText = isFocused ? `Available Apps (${fetchCacheData().musicApps.length})`            : "Unfocused - Available Apps...";
             if (isFocused && isSelectionItem) this.focusedSelectionItem = name;
        else if (this.focusedSelectionItem.toLowerCase().includes(name.toLowerCase()) && isSelectionItem) this.focusedSelectionItem = "";

        this.modify(!isSelectionItem ? `${name} Option` : `${name} - Selection Menu`, {
            lineColor: Color3.fromHex(isFocused ? fetchSettingsData().lineColor.focused : this.fetchProperties(`${name} - Selection Menu`)?.unfocusedLineColor || fetchSettingsData().lineColor.unfocused),
            isFocused
        });

        if (!isInput && titleText) {
            this.modify(!isSelectionItem ? `${name} Title` : `${name} - Selection Title`, {
                text: titleText
            });
        }

        this.modify(!isSelectionItem ? `${name} Title` : `${name} - Selection Title`, {
            textColor: Color3.fromHex(isFocused ? fetchSettingsData().textColor.focused : fetchSettingsData().textColor.unfocused),
            isFocused
        });

        this.modify("Selection Menu Title", {
            text: this.focusedObject.trim() !== "" ? `${base} (${this.focusedObject.replace(" Option", "")})` : `${base} (No menu selected)`
        });

        this.rescribble();
    }

    // Stuff with the Selection Menu (Item displayer)

    fetchSelectionMenuIndex(): number {
        let index = 0;
        for (const object of this.objects) {
            if (object[0].toLowerCase().includes("- selection menu")) index++;
        }

        return index;
    }

    fetchPage(
        callback: any
    ): number {
        let page = 1;
        if (this.pageItems.size !== 0) {
            let index = 0;
            this.pageItems.forEach((value: [string, number, string, (pressed: string, key: any) => any, string?], key: string) => {
                const page = Math.floor(index / 5) + 1;
                this.pageItems.set(key, [value[0], page, value[2], callback]);
                index++;
            });

            this.highestPage = Math.ceil(this.pageItems.size / 5);
        }

        return page;
    }

    private inputListeners: Map<string, (__string: string, key: any) => void> = new Map();
    makeSelectionInput(
        name: string = `Textbox (${this.fetchSelectionMenuIndex()}) - Selection Menu`,
        defaultText: string = "", placeholder: string = "Type here ...",
        isFocused: boolean,
        callback: (value: string) => any
    ) {
        const page = this.fetchPage(callback);
        const highestLength = 59;

        if (!this.inputValues.has(name)) this.inputValues.set(name, defaultText);
        let buffer = this.inputValues.get(name)!;

        this.makeFrame(
            `${name} - Selection Menu`,
            62, 2,
            4, 4 + this.fetchSelectionMenuIndex() * 6,
            Color3.fromHex(isFocused ? fetchSettingsData().lineColor.focused : fetchSettingsData().lineColor.unfocused),
            isFocused
        );

        this.makeLabel(
            `${name} - Selection Title`,
            buffer || placeholder,
            6, this.fetchSelectionMenuIndex() * 3,
            Color3.fromHex(isFocused ? fetchSettingsData().textColor.focused : fetchSettingsData().textColor.unfocused),
            isFocused
        );

        const render = (content: string) => {
            this.modify(`${name} - Selection Title`, {
                text: content.length > 0 ? content : placeholder
            });
        };

        const existingListener = this.inputListeners.get(name);
        if (existingListener) {
            process.stdin.off("keypress", existingListener);
            this.inputListeners.delete(name);
        }

        const listener = (__string: string, key: any) => {
            if (!this.isObjectFocused(name)) return;
            let currentBuffer = this.inputValues.get(name)!;
            if (key.name === "return" || key.name === "enter") {
                callback(currentBuffer);
                process.stdin.off("keypress", listener);
                this.rescribble();
                this.serve();
                return;
            }

                 if (key.name === "backspace") currentBuffer = currentBuffer.slice(0, -1);
            else if (__string && __string.length === 1 && currentBuffer.length < highestLength) currentBuffer += __string;

            this.inputValues.set(name, currentBuffer);
            render(currentBuffer);
            this.rescribble();
            this.serve();
        };

        process.stdin.on("keypress", listener);

        this.inputListeners.set(name, listener);
        this.pageItems.set(name, [name, page, "Input", callback, placeholder]);
    }

    private itemListeners: Map<string, (__string: string, key: any) => void> = new Map();
    makeSelectionItem(
        name: string = `Default Object (${this.fetchSelectionMenuIndex()}) - Selection Menu`,
        isFocused: boolean,
        callback: (pressed: string, key: any) => any
    ) {
        const page = this.fetchPage(callback);
        this.makeFrame(
            !name.toLowerCase().includes("- selection menu") ? `${name} - Selection Menu` : name,
            62, 2,
            4, 4 + this.fetchSelectionMenuIndex() * 6,
            Color3.fromHex(isFocused ? fetchSettingsData().lineColor.focused : fetchSettingsData().lineColor.unfocused),
            isFocused
        );

        this.makeLabel(
            `${name} - Selection Title`, name.replace(" - Selection Title", "").length > 59 ? name.replace(" - Selection Title", "").slice(0, 55) + " ..." : name.replace(" - Selection Title", ""),
            6, this.fetchSelectionMenuIndex() * 3,
            Color3.fromHex(isFocused ? fetchSettingsData().textColor.focused : fetchSettingsData().textColor.unfocused),
            isFocused
        );

        const existingListener = this.itemListeners.get(name);
        if (existingListener) {
            process.stdin.off("keypress", existingListener);
            this.itemListeners.delete(name);
        }

        const listener = (__string: string, key: any) => {
            if (!this.isObjectFocused(name)) return;
            let action: string | null = null;
            let pressed = this.focusedSelectionItem;
            if (!key) return;
                 if (key.sequence == " " || key.name === "return" || key.name === "enter" || key.sequence === "\r" || key.sequence === "\n") action = "enter";
            else if (key.name === "space") action = "space";
            if (action) {
                callback(pressed, key.name);
            }

            this.rescribble();
            this.serve();
        };

        process.stdin.on("keypress", listener);

        this.itemListeners.set(name, listener);
        this.pageItems.set(name, [name, page, "Button", callback]);
    }

    fetchSelectionItemFromIndex(
        desiredIndex: number
    ): string {
        this.focusedSelectionItemIndex = desiredIndex;
        let object = "";
        let index = 1;
        for (const [_, [item]] of this.pageItems) {
            if (this.focusedSelectionItemIndex > this.pageItems.size) this.focusedSelectionItemIndex = 1;
            if (this.focusedSelectionItemIndex < 1) this.focusedSelectionItemIndex = this.pageItems.size;
            if (index === this.focusedSelectionItemIndex) {
                object = item;
                break;
            }

            index++;
        }
        
        return object;
    }

    fetchIndexFromSelectionItem(
        name: string
    ): number {
        let index = 1;
        for (const [_, [item]] of this.pageItems) {
            if (item === name) break;
            index++;
        }

        return index;
    }

    focusSelectionItem(
        name: string
    ) {
        const item = this.pageItems.get(name);
        const isTextBox = item?.[2] !== "Button";
        for (let index = 0; index <= this.pageItems.size; index++) {
            this.focusObject(this.fetchSelectionItemFromIndex(index), false, true, isTextBox);
        }

        this.focusObject(name, true, true);
        this.focusedSelectionItemIndex = this.fetchIndexFromSelectionItem(name);
    }

    choosePage(
        page: number
    ) {
        if (this.fetchSelectionMenuIndex() === 0) return;
        if (this.fetchSelectionMenuIndex() !== 0) this.clearSelectionMenu();
        if (page > this.highestPage || page < 1) {
            page = 1;
            this.focusedSelectionItemIndex = 0;
        }
        
        this.focusedPage = page;
        this.modify("Selection Menu Title", {
            text: `Lily's Playlist Conversion Tool (Page ${this.focusedPage} of ${this.highestPage})`
        });

        for (const [_, [name, page, object, callback, placeholder]] of this.pageItems) {
            if (page === this.focusedPage && !this.cache.includes(name)) {
                this.cache.push(name);

                  if (object === "Button") this.makeSelectionItem(name, false, callback);
                else this.makeSelectionInput(name, this.inputValues.get(name) ?? "", placeholder, false, callback);
            }
        }
    }

    clearSelectionMenu() {
        this.cache = [];
        this.focusedSelectionItem = "";
        this.focusedSelectionItemIndex = 0;
        for (const object of this.objects) {
            if (object[0].toLowerCase().includes("- selection menu") || object[0].toLowerCase().includes("- selection title")) {
                this.remove(object[0], this.objects);
            }
        }

        this.rescribble();
    }
}

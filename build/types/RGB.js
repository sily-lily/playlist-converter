"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Color3 = void 0;
/**
 *
 * Inspired by Roblox's Color3 class.
 */
class Color3 {
    R = 0;
    G = 0;
    B = 0;
    constructor(R, G, B) {
        this.R = R;
        this.G = G;
        this.B = B;
    }
    static new(R, G, B) {
        return new Color3(R, G, B);
    }
    static fromRGB(R, G, B) {
        return new Color3(R, G, B);
    }
    static fromHSV(H, S, V) {
        var C = V * S;
        var X = C * (1 - Math.abs((H / 60) % 2 - 1));
        var M = V - C;
        var R = 0, G = 0, B = 0;
        if (H < 60) {
            R = C;
            G = X;
        }
        else if (H < 120) {
            R = X;
            G = C;
        }
        else if (H < 180) {
            G = C;
            B = X;
        }
        else if (H < 240) {
            G = X;
            B = C;
        }
        else if (H < 300) {
            R = X;
            B = C;
        }
        else {
            R = C;
            B = X;
        }
        return new Color3(Math.round((R + M) * 255), Math.round((G + M) * 255), Math.round((B + M) * 255));
    }
    static fromHex(hex) {
        if (hex.startsWith("#"))
            hex = hex.slice(1);
        if (hex.length === 3)
            hex = hex.split("").map(C => C + C).join("");
        var R = parseInt(hex.slice(0, 2), 16);
        var G = parseInt(hex.slice(2, 4), 16);
        var B = parseInt(hex.slice(4, 6), 16);
        return new Color3(R, G, B);
    }
    /**
     *
     * Changes the color of the text itself, unlike `toAnsiBg(<text: string>)`, which changes the
     *  background of the text, rather than the color of it.
     *
     * @example
     * ```ts
     * import { Color3 } from "./Color3";
     * console.log(Color3.fromRGB(200, 0, 0).toAnsi("Just some silly red text! :3"));
     * ```
     */
    toAnsi(text) {
        return `\x1b[38;2;${this.R};${this.G};${this.B}m${text}\x1b[0m`;
    }
    /**
     *
     * Similar to `toAnsi(<text: string>)`, however modify the background rather than the text itself.
     *
     * @example
     * ```ts
     * import { Color3 } from "./Color3";
     * console.log(Color3.fromRGB(0, 200, 0).toAnsiBg("Green background using .fromRGB"));
     * ```
     */
    toAnsiBg(text) {
        return `\x1b[48;2;${this.R};${this.G};${this.B}m${text}\x1b[0m`;
    }
}
exports.Color3 = Color3;
//# sourceMappingURL=RGB.js.map
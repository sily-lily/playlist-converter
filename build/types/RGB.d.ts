/**
 *
 * Inspired by Roblox's Color3 class.
 */
export declare class Color3 {
    R: number;
    G: number;
    B: number;
    constructor(R: number, G: number, B: number);
    static new(R: number, G: number, B: number): Color3;
    static fromRGB(R: number, G: number, B: number): Color3;
    static fromHSV(H: number, S: number, V: number): Color3;
    static fromHex(hex: string): Color3;
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
    toAnsi(text: string): string;
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
    toAnsiBg(text: string): string;
}
//# sourceMappingURL=RGB.d.ts.map
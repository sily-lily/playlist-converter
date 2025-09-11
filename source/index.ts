import { Container } from "./drawing/drawing";
import { Color3 } from "./drawing/RGB";

const main = new Container(70, 20);
const unfocused = "#4c3a50ff";
const focused = "#f2afffff";

main.new(66, 15, Color3.fromHex("#f0a3ffff"), 2, 1);
main.new(32, 2, Color3.fromHex(unfocused), 2, 34);
main.new(32, 2, Color3.fromHex(focused), 36, 34);
main.write("hello world :3", 5, 3);
main.write("Unfocused - Your Saved Pla...", 4, 18, Color3.fromRGB(180, 180, 180)); // "ylists (0)" ~ Missing text (Pretend it works automatically)
main.write("Available Music Apps (0)", 38, 18)
main.serve();
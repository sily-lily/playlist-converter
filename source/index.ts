import { Container } from "./drawing/drawing";
import { Color3 } from "./drawing/RGB";

const main = new Container(70, 20);
const unfocused = "#4c3a50ff";
const focused = "#f2afffff";
const unfocusedTextColor = Color3.fromRGB(180, 180, 180);
const focusedTextColor = Color3.fromRGB(255, 255, 255);

const apps = [
    "Apple Music",
    "Spotify",
    "YouTube Music"
];
const availableMusicApps = apps.length;

main.new(66, 15, Color3.fromHex(focused), 2, 2, "Selection Menu");
main.write("Lily's Playlist Converter [v1.0] (No menu selected)", 5, 1, focusedTextColor, "Selection Menu Title")

// // Saved Playlists Option

main.new(32, 2, Color3.fromHex(unfocused), 2, 34, "Saved Playlists Option");
main.write("Unfocused - Your Saved Pla...", 4, 18, unfocusedTextColor, "Saved Playlists Title"); // "ylists (0)" ~ Missing text (Pretend it works automatically)

// // Music Apps Option

main.new(32, 2, Color3.fromHex(focused), 36, 34, "Available Music Apps Option");
main.write(`Available Music Apps (${availableMusicApps})`, 38, 18, focusedTextColor, "Available Music Apps Title");

main.serve();
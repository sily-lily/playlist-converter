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
const savedPlaylists = 0; // temp
var focusedTab = "";

function focusWindow(tab: string, isFocused: boolean) {
    const base = "Lily's Playlist Converter [v1.0]";
    var updateText = "";
    if (tab.toLowerCase() === "saved playlists") {
        updateText = isFocused ? `Your Saved Playlists (${savedPlaylists})` : "Unfocused - Your Saved Pla...";
    } else if (tab.toLowerCase() === "available music apps") {
        updateText = isFocused ? `Available Music Apps (${availableMusicApps})` : "Unfocused - Available Musi...";
    }

    main.update(`${tab} Option`, { lineColor: Color3.fromHex(isFocused ? focused : unfocused) });
    main.update(`${tab} Title`, {
        text: updateText,
        color: isFocused ? focusedTextColor : unfocusedTextColor
    });
    
    focusedTab = isFocused ? `${tab} Option` : focusedTab;
    main.update("Selection Menu Title", { text: focusedTab.trim() !== "" ? `${base} (${focusedTab.replace(" Option", "")})` : `${base} (No menu selected)` });
}

main.new(66, 15, Color3.fromHex(focused), 2, 2, "Selection Menu");
main.write("Lily's Playlist Converter [v1.0] (No menu selected)", 5, 1, focusedTextColor, "Selection Menu Title")

// Saved Playlists Option

main.new(32, 2, Color3.fromHex(focused), 2, 34, "Saved Playlists Option");
main.write(`Your Saved Playlists (${savedPlaylists})`, 4, 18, focusedTextColor, "Saved Playlists Title");

// Music Apps Option

main.new(32, 2, Color3.fromHex(focused), 36, 34, "Available Music Apps Option");
main.write(`Available Music Apps (${availableMusicApps})`, 38, 18, focusedTextColor, "Available Music Apps Title");

focusWindow("Saved Playlists", false);
focusWindow("Available Music Apps", false);
main.newSelectionMenuItem();
main.newSelectionMenuItem();
main.newSelectionMenuItem();
main.newSelectionMenuItem();
main.serve();
import { fetchCacheData, fetchProjectVersion, fetchSettingsData } from "./data";
import { Container } from "./drawing/drawing";
import { Color3 } from "./drawing/RGB";

// Main Container

const main = new Container(70, 21);

main.new(66, 16, Color3.fromHex(fetchSettingsData().lineColor.focused), 2, 2, "Selection Menu", false);
main.write(`Lily's Playlist Converter [${fetchProjectVersion()}] (No menu selected)`, 5, 1, Color3.fromHex(fetchSettingsData().textColor.focused), "Selection Menu Title", false)

// Saved Playlists Option

main.new(32, 2, Color3.fromHex(fetchSettingsData().lineColor.focused), 2, 36, "Saved Playlists Option", false);
main.write(`Your Saved Playlists (${fetchCacheData().savedPlaylists})`, 4, 19, Color3.fromHex(fetchSettingsData().textColor.focused), "Saved Playlists Title", false);

// Apps Option

function listApps() {
    if (!main.isOptionFocused("Available Apps Option")) return;
    for (const app of fetchCacheData().musicApps) {
        main.newSelectionMenuItem(app, false);
    }
    main.selectPage(1);
}

main.new(32, 2, Color3.fromHex(fetchSettingsData().lineColor.focused), 36, 36, "Available Apps Option", false);
main.write(`Available Apps (${fetchCacheData().musicApps.length})`, 38, 19, Color3.fromHex(fetchSettingsData().textColor.focused), "Available Apps Title", false);

// Pre-requisites

main.focusObject("Available Apps", true);
main.focusObject("Saved Playlists", false);
listApps();

// Launch the Program :3

main.serve();
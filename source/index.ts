import { fetchCacheData, fetchProjectVersion, fetchSettingsData } from "./modules/information";
import { Container } from "./classes/Container";
import { Color3 } from "./modules/RGB";
import { makeInputs } from "./classes/InputManager";

const container = new Container(70, 21);

// Main Container

container.new(66, 16, Color3.fromHex(fetchSettingsData().lineColor.unfocused), 2, 2, "Selection Menu Option", false);
container.write(`Lily's Playlist Converter (No menu selected)`, 5, 1, Color3.fromHex(fetchSettingsData().textColor.unfocused), "Selection Menu Title", false)

// Saved Playlists Option

export function listPlaylists() {
    if (!container.isOptionFocused("Saved Playlists Option")) return;
    if (fetchCacheData().savedPlaylists.length !== 0) {
        for (const app of fetchCacheData().savedPlaylists) {
            container.newSelectionMenuItem(app, false);
        }
        container.selectPage(1);
    }
}

container.new(32, 2, Color3.fromHex(fetchSettingsData().lineColor.unfocused), 2, 36, "Saved Playlists Option", false);
container.write(`Your Saved Playlists (${fetchCacheData().savedPlaylists.length})`, 4, 19, Color3.fromHex(fetchSettingsData().textColor.unfocused), "Saved Playlists Title", false);

// Apps Option

export function listApps() {
    if (!container.isOptionFocused("Available Apps Option")) return;
    if (fetchCacheData().musicApps.length !== 0) {
        for (const app of fetchCacheData().musicApps) {
            container.newSelectionMenuItem(app, false);
        }
        container.selectPage(1);
    }
}

container.new(32, 2, Color3.fromHex(fetchSettingsData().lineColor.unfocused), 36, 36, "Available Apps Option", false);
container.write(`Available Apps (${fetchCacheData().musicApps.length})`, 38, 19, Color3.fromHex(fetchSettingsData().textColor.unfocused), "Available Apps Title", false);

// Pre-requisites

container.focusObject("Selection Menu", true);
container.focusObject("Available Apps", false);
container.focusObject("Saved Playlists", false);

listPlaylists();
listApps();
makeInputs(container);

// Launch the Program :3

container.serve();
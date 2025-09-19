import { fetchCacheData, fetchSettingsData, modifyCacheData } from "./modules/information";
import { Container } from "./classes/Container";
import { Color3 } from "./classes/RGB";
import { makeBinds } from "./classes/InputManager";
import { removeDuplicates } from "./modules/miscellaneous";

const main = new Container(70, 21, "");

function clean() {
    main.pageItems.clear();
    main.cache = [];
}

// Main Container

main.makeFrame("Selection Menu Option", 66, 16, 2, 2, Color3.fromHex(fetchSettingsData().lineColor.unfocused), false);
main.makeLabel("Selection Menu Title", `Lily's Playlist Conversion Tool (No menu selected)`, 5, 1, Color3.fromHex(fetchSettingsData().textColor.unfocused), false);

// Saved Playlists Option

export function listPlaylists() {
    if (!main.isObjectFocused("Saved Playlists")) return;
    if (fetchCacheData().savedPlaylists.length !== 0) {
        clean();
        for (const app of fetchCacheData().savedPlaylists) {
            main.makeSelectionItem(app, false, () => {});
        }

        main.choosePage(1);
    }
}

main.makeFrame("Saved Playlists Option", 32, 2, 2, 36, Color3.fromHex(fetchSettingsData().lineColor.unfocused), false);
main.makeLabel("Saved Playlists Title", `Your Saved Playlists (${fetchCacheData().savedPlaylists.length})`, 4, 19, Color3.fromHex(fetchSettingsData().textColor.unfocused), false);

// Apps Option

export function listApps() {
    if (!main.isObjectFocused("Available Apps")) return;
    if (fetchCacheData().musicApps.length !== 0) {
        clean();
        for (let app of fetchCacheData().musicApps) {
            main.makeSelectionItem(app, false, (pressed: string, key: any) => {
                if (removeDuplicates(pressed).toLocaleLowerCase().includes(removeDuplicates(app).toLowerCase())) {
                    modifyCacheData({
                        translation: {
                            musicAppFrom: key !== "space" ? pressed : fetchCacheData().translation.musicAppFrom,
                            musicAppTo: key === "space" ? pressed : fetchCacheData().translation.musicAppTo
                        }
                    });

                    // TODO: Make this unfocused line color actually work :3
                    main.modify(`${pressed} - Selection Menu`, {
                        unfocusedLineColor: key === "space" ? Color3.fromHex("#369ec3") : Color3.fromHex("#c33665")
                    });
                }
            });
        }

        main.choosePage(1);
    }
}

main.makeFrame("Available Apps Option", 32, 2, 36, 36, Color3.fromHex(fetchSettingsData().lineColor.unfocused), false);
main.makeLabel("Available Apps Title", `Available Apps (${fetchCacheData().savedPlaylists.length})`, 38, 19, Color3.fromHex(fetchSettingsData().textColor.unfocused), false);

// Pre-requisites

main.focusObject("Selection Menu", true, false);
main.focusObject("Available Apps", false, false);
main.focusObject("Saved Playlists", false, false);

listPlaylists();
listApps();
makeBinds(main);

// Launch the Program :3

main.serve();
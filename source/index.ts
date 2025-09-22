import { fetchCacheData, fetchSettingsData, modifyCacheData } from "./modules/information";
import { Container } from "./classes/Container";
import { Color3 } from "./classes/RGB";
import { makeBinds } from "./classes/InputManager";
import { removeDuplicates } from "./modules/miscellaneous";
import { EventEmitter } from "node:stream";
import { searchSong } from "./modules/API";

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
    } else {
        clean();
        if (fetchCacheData().translation.musicAppFrom.trim() !== "") {
            function showSearches() {
                main.makeSelectionInput("Playlist Search", "", `Provide ${fetchCacheData().translation.musicAppFrom === "Apple Music" ? "an" : "a"} public ${fetchCacheData().translation.musicAppFrom} playlist URL`, false, (value: string) => {
                
                });

                main.makeSelectionInput("Song Search", "", `Search for a song on ${fetchCacheData().translation.musicAppFrom}`, false, (value: string) => {
                    if (value.trim() === "") {
                        clean();
                        main.clearSelectionMenu();
                        main.makeSelectionItem("Searches cannot be empty; Press enter twice to retry", false, (pressed: string, key: any) => {
                            if (key === "return" || key === "space") {
                                clean();
                                main.clearSelectionMenu();
                                listPlaylists();
                            }
                        });
                    } else {
                        searchSong(fetchCacheData().translation.musicAppFrom, value).then((value: string[][]) => {
                            clean();
                            main.clearSelectionMenu();
                            if (value.length !== 0) {
                                value.forEach((value: string[], _: number) => {
                                    main.makeSelectionItem(`"${value[0]}" by ${value[1]}`, false, (pressed: string, key: any) => {
                                        if (key === "return") {
                                            
                                        } else if (key === "space") {
                                            const cache = fetchCacheData().addedSongs;
                                            if (cache.includes(pressed)) return;
                                            cache.push(pressed);
                                            modifyCacheData({
                                                addedSongs: cache
                                            });
                                        }
                                    });
                                });
                            } else {
                                main.makeSelectionItem("No results found; Press enter twice to retry", false, (pressed: string, key: any) => {
                                    if (key === "return" || key === "space") {
                                        clean();
                                        main.clearSelectionMenu();
                                        listPlaylists();
                                    }
                                });
                            }
                        });
                    }
                });
            }

            showSearches();
        } else {
            main.makeSelectionItem("Select an app before searching your playlists!", false, () => {})
        }
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
                    main.pageItems.forEach((value: [string, number, string, any, string?], _: string) => {
                        if (value[0] !== pressed) {
                            main.modify(`${value[0]} - Selection Title`, {
                                text: (main.fetchProperties(`${value[0]} - Selection Title`)?.text!).replace(key === "space" ? "(Converting to)" : "(Converting from)", "")
                            });
                        }
                    });
                    
                    modifyCacheData({
                        translation: {
                            musicAppFrom: key !== "space" ? pressed : fetchCacheData().translation.musicAppFrom,
                            musicAppTo: key === "space" ? pressed : fetchCacheData().translation.musicAppTo
                        }
                    });

                    main.modify(`${pressed} - Selection Title`, {
                        text: `${pressed} (Converting ${key === "space" ? "to" : "from"})`
                    });
                    main.serve();
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
EventEmitter.setMaxListeners(10 ** 21);

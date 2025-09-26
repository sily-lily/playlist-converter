import { fetchCacheData, fetchSettingsData, modifyCacheData } from "./modules/information";
import { Container } from "./classes/Container";
import { Color3 } from "./classes/RGB";
import { makeBinds } from "./classes/InputManager";
import { outApp } from "./modules/miscellaneous";
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
                        main.makeSelectionItem("Searches cannot be empty; please try again", false, (pressed: string, key: any) => {
                            if ((key === "return" || key === "enter") || key === "space") {
                                clean();
                                main.clearSelectionMenu();
                                listPlaylists();
                                main.choosePage(1);
                            }
                        });

                        main.choosePage(1);
                    } else {
                        searchSong(fetchCacheData().translation.musicAppFrom, value).then((value: string[][]) => {
                            clean();
                            main.clearSelectionMenu();
                            if (value.length !== 0) {
                                value.forEach((value: string[], _: number) => {
                                    const title = `${fetchCacheData().addedSongs.includes(`\"${value[0]}\" by ${value[1]}`) ? "(Selected) " : ""}"${value[0]}" by ${value[1]}`;
                                    main.makeSelectionItem(title, false, (pressed: string, key: any) => {
                                        if (key === "return" || key === "enter") {
                                            if (fetchCacheData().addedSongs.length === 0) return;
                                            clean();
                                            main.clearSelectionMenu();
                                            switch (outApp().toLowerCase()) {
                                                case "none":
                                                    main.makeSelectionItem("Select an app to convert to before making playlists", false, (pressed: string, key: any) => {
                                                        if (key === "space" || (key === "return" || key === "enter")) {
                                                            clean();
                                                            main.clearSelectionMenu();
                                                        }
                                                    });
                                                    break;

                                                case "token":
                                                    main.makeSelectionItem(`Set your ${fetchCacheData().translation.musicAppTo} token in the ".env" file first`, false, (pressed: string, key: any) => {
                                                        if (key === "space" || (key === "return" || key === "enter")) {
                                                            clean();
                                                            main.clearSelectionMenu();
                                                        }
                                                    });
                                                    break;

                                                default:
                                                    main.makeSelectionItem("test", false, () => {});
                                                    break;
                                            }
                                        } else if (key === "space") {
                                            let cache = fetchCacheData().addedSongs;
                                            const cleansed = pressed.replace("(Selected) ", "");
                                              if (!cache.includes(cleansed)) cache.push(cleansed); 
                                            else cache = cache.filter(item => item !== cleansed);
                                            modifyCacheData({
                                                addedSongs: cache
                                            });

                                            const text = `${fetchCacheData().addedSongs.includes(cleansed) ? "(Selected) " : ""}${cleansed}`;
                                            main.modify(`${pressed} - Selection Title`, {
                                                text: text.replace(" - Selection Title", "").length > 59 ? text.replace(" - Selection Title", "").slice(0, 55) + " ..." : text.replace(" - Selection Title", "")
                                            });
                                        }
                                    });
                                });
                                
                                main.choosePage(1);
                            } else {
                                main.makeSelectionItem("No results found; please try again", false, (pressed: string, key: any) => {
                                    if ((key === "return" || key === "enter") || key === "space") {
                                        clean();
                                        main.clearSelectionMenu();
                                        listPlaylists();
                                    }
                                });
                            }

                            main.choosePage(1);
                        });
                    }
                });
                
                main.choosePage(1);
            }

            showSearches();
        } else {
            main.makeSelectionItem("Select an app to convert from before searching", false, (pressed: string, key: any) => {
                if (key === "space" || (key === "return" || key === "enter")) {
                    clean();
                    main.clearSelectionMenu();
                }
            });

            main.choosePage(1);
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
                main.pageItems.forEach((value: [string, number, string, any, string?], _: string) => {
                    if (value[0] !== pressed) {
                        main.modify(`${value[0]} - Selection Title`, {
                            text: (main.fetchProperties(`${value[0]} - Selection Title`)?.text!).replace(key === "space" ? "(Converting to)" : "(Converting from)", "")
                        });
                    }
                });
                
                let normalizedPressed = pressed.trim();
                let normalizedFrom = fetchCacheData().translation.musicAppFrom.trim();
                let normalizedTo = fetchCacheData().translation.musicAppTo.trim();
                let newFrom = (key === "return" || key === "enter") ? normalizedPressed : normalizedFrom;
                let newTo = (key === "space") ? normalizedPressed : normalizedTo;
                if (newFrom === newTo && newFrom !== "") {
                    if (key === "space") {
                        newFrom = "";
                        newTo = normalizedPressed;
                    } else {
                        newFrom = normalizedPressed;
                        newTo = "";
                    }
                }

                modifyCacheData({
                    translation: {
                        musicAppFrom: newFrom,
                        musicAppTo: newTo
                    }
                });

                main.modify(`${pressed} - Selection Title`, {
                    text: `${pressed} (Converting ${key === "space" ? "to" : "from"})`
                });

                main.serve();
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

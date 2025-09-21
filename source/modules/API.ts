import YTMusic from "ytmusic-api";

export async function searchSong(
    app: string,
    name: string
): Promise<string[][]> {
    // [[Song: <String>, Artist: <String>]]
    const songs: string[][] = [];
    switch (app.toLowerCase()) {
        case "apple music":
            
        case "spotify":
            
        case "youtube music":
            const Client = new YTMusic();
            await Client.initialize();

            Client.search(name).then(found => {
                found.forEach(song => {
                    try {
                        if (song.type === "SONG") {
                            songs.push([song.name, song.artist.name]);
                        }
                    } catch {};
                })
            });
    }

    return songs;
}

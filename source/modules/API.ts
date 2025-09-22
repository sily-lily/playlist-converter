import YTMusic from "ytmusic-api";

export async function searchSong(
    app: string,
    name: string
): Promise<string[][]> {
    const songs: string[][] = [];
    switch (app.toLowerCase()) {
        case "apple music":
            
        case "spotify":
            
        case "youtube music":
            const Client = new YTMusic();
            await Client.initialize();
            
            const found = await Client.search(name);
            found.forEach(song => {
                if (song.type === "SONG" || song.type === "VIDEO") {
                    if (songs.includes([song.name, song.artist.name])) return;
                    songs.push([song.name, song.artist.name]);
                }
            });
    }

    return songs;
}

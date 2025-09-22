import { configDotenv } from "dotenv";
import { fetchCacheData } from "./information";

export function wait(
  seconds: number,
  callback: () => any
) {
    setTimeout(callback, seconds * 1000);
}

export function removeDuplicates(
  input: string
): string {
  for (let index = 1; index <= input.length / 2; index++) {
    if (input.length % index === 0) {
      const subbed = input.slice(0, index);
      if (subbed.repeat(input.length / index) === input) return subbed;
    }
  }

  return input;
}

export function outApp(): string {
  configDotenv({ quiet: true });
  let app = fetchCacheData().translation.musicAppTo !== "" ? fetchCacheData().translation.musicAppTo : "None";
  switch (app.toLowerCase()) {
    case "apple music":
      if (process.env.APPLE_MUSIC_TOKEN === "") app = "Token";
      break;
    
    case "spotify":
      if (process.env.SPOTIFY_TOKEN === "") app = "Token";
      break;

    case "youtube music":
      if (process.env.YOUTUBE_MUSIC_TOKEN === "") app = "Token";
      break;
  }

  return app;
}
import fs, { PathOrFileDescriptor } from "node:fs";
import path from "node:path";
import { cache, settings } from "../types";

export function formatJSON(filePath: PathOrFileDescriptor): Object {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function fetchSettingsData(): settings {
    return formatJSON(path.join(process.cwd(), "settings.json")) as settings;
}

export function fetchCacheData(): cache {
    return formatJSON(path.join(process.cwd(), "cache.json")) as cache;
}

export function fetchProjectVersion(): string {
    return (formatJSON(path.join(process.cwd(), "package.json")) as {
        version: string
    }).version;
}

export function modifyCacheData(
    modifications: Partial<cache>
) {
    const currentCacheData = fetchCacheData();
    const modified = { ...currentCacheData, ...modifications };
    
    fs.writeFileSync(path.join(process.cwd(), "cache.json"), JSON.stringify(modified, null, 2), "utf-8");
}
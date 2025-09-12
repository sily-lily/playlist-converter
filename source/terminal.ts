export function wait(seconds: number, callback: () => any) {
    setTimeout(callback, seconds * 1000);
}
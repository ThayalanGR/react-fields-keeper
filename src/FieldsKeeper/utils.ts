export function getUniqueId() {
    return new Date().getTime().toString();
}

export function clone(item: unknown) {
    return JSON.parse(JSON.stringify(item))
}
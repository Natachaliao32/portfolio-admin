const typedKeys = <T,>(o: T): (keyof T)[] => {
    // type cast should be safe because that's what really Object.keys() does
    return Object.keys(o) as (keyof T)[];
}

const typedEntries = <T,>(o: T): [(keyof T), any][] => {
    // type cast should be safe because that's what really Object.keys() does
    return Object.entries(o) as [(keyof T), any][];
}

const setProperty = <T, K extends keyof T,>(obj: T, key: K, value: T[K]) => {
    obj[key] = value; 
}

export { typedKeys, typedEntries, setProperty}
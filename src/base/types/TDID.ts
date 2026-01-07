export type DID = `did:plc:${string}`;

export function isValidDID(x: string): x is DID {
    return x.startsWith("did:plc:");
}

export function DID<T extends string>(x: T & (string extends T ? string : DID)): DID {
    if (!isValidDID(x))
        throw new Error(`"${x}" is not a valid DID string.`);;
    return x;
}

import { DidResolver, HandleResolver } from "@atproto/identity";
import { ensureValidDid, isValidHandle } from "@atproto/syntax";

export async function atInfo(input: string): Promise<object>
{
    const didres = new DidResolver({});
    const hdlres = new HandleResolver({});

    if (isValidHandle(input))
    {
        const did = await hdlres.resolve(input);

        if (did == undefined)
        {
            throw new Error('undefined did returned from handle');
        }

        const data = await didres.resolveAtprotoData(did);

        if (data.handle != input) {
            throw new Error('invalid handle (did not match DID document)');
        }

        return data;
    }

    ensureValidDid(input);

    const data = await didres.resolveAtprotoData(input);

    return data;
}

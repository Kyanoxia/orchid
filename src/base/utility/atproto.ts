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
            throw new Error('Invalid user ' + input + ' - result is undefined');
        }
        else
        {
            const data = await didres.resolveAtprotoData(did);

            console.log(data);
            return data;
        }
    }
    else
    {
        const did = await didres.resolve(input);

        if (did?.id == undefined)
        {
            throw new Error('Invalid user ' + input + ' - result is undefined');
        }
        else
        {
            const data = await didres.resolveAtprotoData(did?.id);

            return data;
        }
    }
}

export async function isValid(input: string): Promise<boolean>
{
    const didres = new DidResolver({});
    const hdlres = new HandleResolver({});

    if (isValidHandle(input))
    {
        const did = await hdlres.resolve(input);

        if (did == undefined)
        {
            return false;
        }
        else
        {
            return true;
        }
    }
    else
    {
        const did = await didres.resolve(input);

        if (did == undefined)
        {
            return false;
        }
        else
        {
            return true;
        }
    }
}

export async function getHandleValidity(input: string): Promise<boolean>
{
    const hdlres = new HandleResolver({});

    if (isValidHandle(input))
    {
        const did = await hdlres.resolve(input);

        if (did == undefined)
        {
            return false;
        }
        else
        {
            return true;
        }
    }
    else
    {
        return false;
    }
}

export async function getDIDValidity(input: string): Promise<boolean>
{
    const didres = new DidResolver({});

    try {
        ensureValidDid(input);
    } catch (err) {
        return false;
    }

    const did = await didres.resolve(input);

    if (did?.id == undefined)
    {
        return false;
    }
    else
    {
        return true;
    }
}

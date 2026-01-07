import bcrypt from "bcryptjs";
import { createHmac } from "crypto";

export function genPassword(password: string): string {
    const salt = bcrypt.genSaltSync();
    const hmac = createHmac('sha256', salt);

    hmac.update(password);

    const hash = hmac.digest('base64');
    const crypto = bcrypt.hashSync(hash, salt);

    return crypto;
}

export async function testPassword(password: string, hash: string): Promise<boolean> {
    let salt: string;
    try {
        salt = bcrypt.getSalt(hash);
    } catch (err) {
        return false;
    }

    const hmac = createHmac('sha256', salt);
    hmac.update(password);
    const crypto = hmac.digest('base64');

    return await bcrypt.compare(crypto, hash);
}

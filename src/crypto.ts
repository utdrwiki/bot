'use strict';

type KeyUsage = 'sign' | 'verify';

/**
 * Converts a string to a CryptoKey object for use in HMAC operations.
 * @param secretKey Secret key to convert
 * @param usage Whether the key will be used for signing or verification
 * @returns CryptoKey object
 */
function getSecretKey(secretKey: string, usage: KeyUsage): Promise<CryptoKey> {
    const encodedKey = new TextEncoder().encode(secretKey);
    return crypto.subtle.importKey('raw', encodedKey, {
        hash: 'SHA-256',
        name: 'HMAC'
    }, false, [usage]);
}

/**
 * Generates a token to be used as OAuth2 state for a user with a given Discord
 * ID. The token consists of an HMAC signature and the user ID, both encoded in
 * Base-64.
 * @param userId Discord user ID
 * @param secretKey Secret key to use for the HMAC signature
 * @returns OAuth2 state token
 */
export async function generateToken(
    userId: string,
    secretKey: string
): Promise<string> {
    const key = await getSecretKey(secretKey, 'sign');
    const bigIntArrayId = new BigUint64Array([BigInt(userId)]);
    const signature = await crypto.subtle.sign('HMAC', key, bigIntArrayId);
    const tokenBigInts = new BigUint64Array(5);
    tokenBigInts.set(bigIntArrayId, 0);
    tokenBigInts.set(new BigUint64Array(signature), 1);
    return Buffer.from(tokenBigInts.buffer).toString('hex');
}

/**
 * Verifies a token to ensure it was generated by the server and extract the
 * Discord user ID from it.
 * @param token Received token from OAuth2 state
 * @param secretKey Secret key to use for the HMAC signature
 * @returns Discord user ID
 * @throws {Error} If the token is invalid
 */
export async function verifyToken(
    token: string,
    secretKey: string
): Promise<string> {
    const decodedBuffer = Buffer.from(token, 'hex');
    if (decodedBuffer.byteLength !== 40) {
        throw new Error('Invalid token.');
    }
    const [userId, ...signature] = new BigUint64Array(decodedBuffer.buffer);
    const key = await getSecretKey(secretKey, 'verify');
    const userIdArray = new BigUint64Array([userId]);
    const signatureArray = new BigUint64Array(signature);
    if (!await crypto.subtle.verify('HMAC', key, signatureArray, userIdArray)) {
        throw new Error('Invalid token.');
    }
    return userId.toString();
}

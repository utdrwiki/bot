'use strict';

const ACCEPTABLE_TIME_DIFF = 5 * 60 * 1000;

/**
 * Reports to Discord when ZeptoMail experiences a hard bounce.
 * @param request Request data
 * @param env Environment variables
 * @returns Webhook response
 */
export async function handleZeptomail(
    request: Request,
    env: Env
): Promise<Response> {
    const signatureHeader = request.headers.get('producer-signature');
    if (!signatureHeader) {
        console.error('Missing signature header');
        return new Response(null, {status: 400});
    }
    const decodedSignature = decodeURIComponent(signatureHeader);
    const {ts, s} = Object.fromEntries(
        decodedSignature.split(';').map(part => part.split('='))
    );
    if (!ts || !s) {
        console.error('Missing signature fields');
        return new Response(null, {status: 400});
    }
    const sentTime = Number(ts);
    if (isNaN(sentTime)) {
        console.error('Invalid timestamp:', sentTime);
        return new Response(null, {status: 400});
    }
    if (Date.now() - sentTime > ACCEPTABLE_TIME_DIFF) {
        console.error('Timestamp too far in the past:', sentTime);
        return new Response(null, {status: 400});
    }
    const body = await request.text();
    const encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(env.ZEPTOMAIL_AUTH),
        {
            hash: 'SHA-256',
            name: 'HMAC'
        },
        false,
        ['sign']
    );
    const computedSignature = new Uint8Array(await crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        encoder.encode(body)
    ));
    const receivedSignature = new Uint8Array(Buffer.from(s, 'base64'));
    if (
        receivedSignature.length !== computedSignature.length ||
        !receivedSignature.every((b, i) => b === computedSignature[i])
    ) {
        console.error('Invalid signature:', {
            body,
            computedSignature,
            receivedSignature
        });
        return new Response(null, {status: 400});
    }
    if (JSON.parse(body).event_name.includes('hardbounce')) {
        await fetch(`https://discord.com/api/channels/${env.NOTIFICATION_CHANNEL}/messages`, {
            body: JSON.stringify({
                content: 'Received a hard bounce. Check Zeptomail for details.'
            }),
            headers: {
                'Authorization': `Bot ${env.BOT_TOKEN}`,
                'Content-Type': 'application/json'
            },
            method: 'POST'
        });
    }
    return new Response(null, {status: 204});
}

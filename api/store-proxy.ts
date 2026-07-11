import type { VercelRequest, VercelResponse } from '@vercel/node';

const USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

interface CartAddEntry {
    invID: number;
    invQty: string;
    sellerID: number;
    sourceType: number;
}

module.exports = async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { action, cookie, storeName, sid, itemNo, itemArray } = req.body || {};

    if (!cookie || typeof cookie !== 'string') {
        return res.status(400).json({ error: 'cookie is required' });
    }

    try {
        if (action === 'resolveSid') {
            return await handleResolveSid(res, storeName, cookie);
        }

        if (action === 'search') {
            return await handleSearch(res, storeName, sid, itemNo, cookie);
        }

        if (action === 'addToCart') {
            return await handleAddToCart(res, storeName, sid, itemArray, cookie);
        }

        return res.status(400).json({ error: 'Unknown action' });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

async function handleResolveSid(res: VercelResponse, storeName: string, cookie: string) {
    if (!storeName || typeof storeName !== 'string') {
        return res.status(400).json({ error: 'storeName is required' });
    }

    const pageUrl = `https://store.bricklink.com/${encodeURIComponent(storeName)}`;
    const response = await fetch(pageUrl, {
        headers: {
            'User-Agent': USER_AGENT,
            Cookie: cookie,
            Referer: 'https://www.bricklink.com/',
        },
    });

    if (!response.ok) {
        return res.status(response.status).json({ error: `Bricklink returned status ${response.status}` });
    }

    const html = await response.text();
    const match = html.match(/[?&]sid=(\d+)/) || html.match(/"sid"\s*:\s*"?(\d+)"?/);

    if (!match) {
        return res.status(404).json({ error: 'sid not found for store' });
    }

    return res.status(200).json({ sid: parseInt(match[1], 10) });
}

async function handleSearch(
    res: VercelResponse,
    storeName: string,
    sid: number,
    itemNo: string,
    cookie: string
) {
    if (!sid || !itemNo) {
        return res.status(400).json({ error: 'sid and itemNo are required' });
    }

    const url = new URL('https://store.bricklink.com/ajax/clone/store/searchitems.ajax');
    url.searchParams.set('q', itemNo);
    url.searchParams.set('sort', '0');
    url.searchParams.set('showHomeItems', '0');
    url.searchParams.set('sid', sid.toString());

    const response = await fetch(url.toString(), {
        headers: {
            'User-Agent': USER_AGENT,
            Cookie: cookie,
            Accept: 'application/json, text/javascript, */*; q=0.01',
            Referer: `https://store.bricklink.com/${storeName ?? ''}`,
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        return res.status(response.status).json({ error: `Bricklink returned status ${response.status}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
}

async function handleAddToCart(
    res: VercelResponse,
    storeName: string,
    sid: number,
    itemArray: CartAddEntry[],
    cookie: string
) {
    if (!sid || !Array.isArray(itemArray) || itemArray.length === 0) {
        return res.status(400).json({ error: 'sid and itemArray are required' });
    }

    const body = new URLSearchParams();
    body.set('itemArray', JSON.stringify(itemArray));
    body.set('sid', sid.toString());
    body.set('srcLocation', '1100');

    const response = await fetch('https://store.bricklink.com/ajax/clone/cart/add.ajax', {
        method: 'POST',
        headers: {
            'User-Agent': USER_AGENT,
            Cookie: cookie,
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            Accept: 'application/json, text/javascript, */*; q=0.01',
            Origin: 'https://store.bricklink.com',
            Referer: `https://store.bricklink.com/${storeName ?? ''}`,
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: body.toString(),
    });

    if (!response.ok) {
        return res.status(response.status).json({ error: `Bricklink returned status ${response.status}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
}

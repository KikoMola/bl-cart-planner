import type { VercelRequest, VercelResponse } from '@vercel/node';

module.exports = async function handler(req: VercelRequest, res: VercelResponse) {
    // Permitir CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { idItem, st, show_invid, show_matchcolor } = req.query;

    if (!idItem) {
        return res.status(400).json({ error: 'idItem parameter is required' });
    }

    try {
        // Construir la URL con los parámetros
        const url = new URL('https://www.bricklink.com/v2/catalog/catalogitem_invtab.page');
        url.searchParams.set('idItem', idItem as string);
        url.searchParams.set('st', (st as string) || '1');
        url.searchParams.set('show_invid', (show_invid as string) || '0');
        url.searchParams.set('show_matchcolor', (show_matchcolor as string) || '1');

        // Headers para simular un navegador
        const headers = {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            Referer: 'https://www.bricklink.com/v2/catalog/catalogitem.page',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        };

        // Hacer la petición a Bricklink
        const response = await fetch(url.toString(), { headers });

        if (!response.ok) {
            return res
                .status(response.status)
                .json({ error: `Bricklink returned status ${response.status}` });
        }

        const html = await response.text();

        // Devolver el HTML
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(html);
    } catch (error) {
        console.error('Error fetching from Bricklink:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

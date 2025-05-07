// backend/src/routes/seed.js
import { Router } from 'express';
import mysqlConnectionPool from '../lib/mysql.js';
import { StatusCode } from '../lib/constants.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    await mysqlConnectionPool.query('DELETE FROM products'); // 清空現有數據
    await mysqlConnectionPool.query(
      'INSERT INTO products (id, name, status, price, stock, image_url, available_at) VALUES ?',
      [
        [
          [
            1,
            'Smartphone X Pro',
            'active',
            999.00,
            150,
            'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/smartphone-gaPvyZW6aww0IhD3dOpaU6gBGILtcJ.webp',
            new Date(),
          ],
          [
            2,
            'Wireless Earbuds Ultra',
            'active',
            199.00,
            300,
            'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/earbuds-3rew4JGdIK81KNlR8Edr8NBBhFTOtX.webp',
            new Date(),
          ],
          [
            3,
            'Smart Home Hub',
            'active',
            149.00,
            200,
            'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/home-iTeNnmKSMnrykOS9IYyJvnLFgap7Vw.webp',
            new Date(),
          ],
          [
            4,
            '4K Ultra HD Smart TV',
            'active',
            799.00,
            50,
            'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/tv-H4l26crxtm9EQHLWc0ddrsXZ0V0Ofw.webp',
            new Date(),
          ],
          [
            5,
            'Gaming Laptop Pro',
            'active',
            1299.00,
            75,
            'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/laptop-9bgUhjY491hkxiMDeSgqb9R5I3lHNL.webp',
            new Date(),
          ],
          [
            6,
            'VR Headset Plus',
            'active',
            349.00,
            120,
            'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/headset-lYnRnpjDbZkB78lS7nnqEJFYFAUDg6.webp',
            new Date(),
          ],
          [
            7,
            'Smartwatch Elite',
            'active',
            249.00,
            250,
            'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/watch-S2VeARK6sEM9QFg4yNQNjHFaHc3sXv.webp',
            new Date(),
          ],
          [
            8,
            'Bluetooth Speaker Max',
            'active',
            99.00,
            400,
            'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/speaker-4Zk0Ctx5AvxnwNNTFWVK4Gtpru4YEf.webp',
            new Date(),
          ],
          [
            9,
            'Portable Charger Super',
            'active',
            59.00,
            500,
            'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/charger-GzRr0NSkCj0ZYWkTMvxXGZQu47w9r5.webp',
            new Date(),
          ],
          [
            10,
            'Smart Thermostat Pro',
            'active',
            199.00,
            175,
            'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/thermostat-8GnK2LDE3lZAjUVtiBk61RrSuqSTF7.webp',
            new Date(),
          ],
        ],
      ]
    );
    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error(error);
    res.status(StatusCode.BAD_REQUEST).json({ error: 'Failed to seed database' });
  }
});

export default router;
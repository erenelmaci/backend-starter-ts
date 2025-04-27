import { Router } from 'express';
import routes from './router';

const router = Router();

const API_URL = process.env.API_URL || '/api';

router.all(API_URL, function (req, res) {
  res.send(`
    <p>
        API Documents:
        <ul>
            <li><a href="${API_URL}/documents/swagger">SWAGGER</a></li>
            <li><a href="${API_URL}/documents/json">JSON <==== POSTMAN OPENAPI IMPORT </a></li>
        </ul>
    </p>
  `);
});

router.use('/api', routes);

router.all('/api', (req, res) => {
  view(res, 404, { message: 'Not Found' });
});

export default router;

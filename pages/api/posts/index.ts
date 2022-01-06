import { apiMethods, badRequest } from '@/utils/api';
import { db } from '@/utils/db';

export default apiMethods({
  GET: {
    handler: async (req, res) => {
      const { _lastId, _limit = '10' } = req.query;
      const cursorOptions: any = _lastId
        ? {
            skip: 1,
            cursor: {
              id: _lastId.toString(),
            },
          }
        : {};
      const posts = await db.post.findMany({
        take: Number(_limit),
        orderBy: { createdAt: 'desc' },
        ...cursorOptions,
      });
      return res.json(posts);
    },
  },
  POST: {
    handler: async (req, res) => {
      if (!req.body) {
        return badRequest(res);
      }
      if (req.body.title === 'failToCreate') {
        return res.status(500).json(req.body);
      }
      const post = await db.post.create({ data: req.body });
      return res.json(post);
    },
  },
});

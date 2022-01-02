import { apiMethods, badRequest } from '@/utils/api';
import { db } from '@/utils/db';

export default apiMethods({
  GET: {
    handler: async (req, res) => {
      const { _start = '0', _limit = '10' } = req.query;
      const skip = Number(_start);
      const take = Number(_limit);
      const posts = await db.post.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
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

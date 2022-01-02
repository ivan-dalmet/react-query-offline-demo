import { apiMethods } from '@/utils/api';
import { db } from '@/utils/db';

export default apiMethods({
  GET: {
    handler: async (req, res) => {
      const { id } = req.query;
      const post = await db.post.findUnique({ where: { id: id.toString() } });
      return res.json(post);
    },
  },
  DELETE: {
    handler: async (req, res) => {
      const { id } = req.query;
      const postToDelete = await db.post.findUnique({
        where: { id: id.toString() },
      });
      if (postToDelete.title === 'failToDelete') {
        return res.status(500).json(postToDelete);
      }
      const post = await db.post.delete({ where: { id: id.toString() } });
      return res.json(post);
    },
  },
});

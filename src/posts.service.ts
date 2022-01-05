import { useToast } from '@chakra-ui/react';
import axios, { AxiosError } from 'axios';
import dayjs from 'dayjs';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

export const getPosts = async ({ page = 0, size = 10 } = {}) => {
  const { data } = await axios.get(
    `/api/posts?_start=${page * size}&_limit=${size}`
  );
  return data;
};

export const createPost = async (payload) => {
  const { data } = await axios.post(`/api/posts`, payload);
  return data;
};

export const getPost = async (id: string) => {
  const { data } = await axios.get(`/api/posts/${id}`);
  return data;
};

export const updatePost = async (payload) => {
  const { data } = await axios.patch(`/api/posts/${payload.id}`, payload);
  return data;
};

export const deletePost = async (id: string) => {
  const { data } = await axios.delete(`/api/posts/${id}`);
  return data;
};

export const useInfinitePosts = () => {
  const queryClient = useQueryClient();
  return useInfiniteQuery(
    ['posts'],
    ({ pageParam = 0 }) => getPosts({ page: pageParam }),
    {
      getNextPageParam: (lastPage, pages) => pages?.length ?? 1,
      onSuccess: (data) => {
        // Pre populate single queries
        data.pages?.flat().forEach((post) => {
          queryClient.setQueryData(['post', post.id], post);
        });
      },
    }
  );
};

export const usePost = (id: string) => {
  return useQuery(['post', id], () => getPost(id), {
    enabled: !!id,
  });
};

export const useCreatePost = (config: any = {}) => {
  const queryClient = useQueryClient();
  const toast = useToast({
    position: 'top-right',
    variant: 'solid',
    isClosable: true,
  });
  return useMutation((payload: any) => createPost(payload), {
    ...config,
    onMutate: (payload) => {
      // Optimistic update
      const tempPost = {
        __offline: true,
        createdAt: dayjs().format(),
        ...payload,
      };
      toast({ status: 'success', title: `Post "${payload.title}" added` });
      queryClient.cancelQueries(['posts']);

      // Pre populate single query
      queryClient.setQueryData(['post', payload.id], tempPost);

      // Pre populate posts list with temporary data
      queryClient.setQueryData(['posts'], (oldData: any) => {
        return {
          ...oldData,
          pages: [[tempPost], ...(oldData?.pages ?? [])],
        };
      });
      config?.onMutate?.(payload);
    },
    onError: (data: any, payload: any, context: any) => {
      toast({
        status: 'error',
        title: `Failed to create post ${payload?.title}`,
      });
      queryClient.setQueryData(['posts'], (oldData: any) => {
        return {
          ...oldData,
          pages: oldData?.pages?.map((posts) =>
            posts.filter((post) => post.id !== payload.id)
          ),
        };
      });
      config?.onError?.(data, payload, context);
    },
    onSuccess: (data, payload, context: any) => {
      // Update single query
      queryClient.setQueryData(['post', data.id], data);

      // Update post in list with data from the server
      queryClient.setQueryData(['posts'], (oldData: any) => {
        return {
          ...oldData,
          pages: oldData?.pages?.map((posts) =>
            posts.map((post) => (post.id === payload.id ? data : post))
          ),
        };
      });
      config?.onSuccess?.(data, payload, context);
    },
  });
};

export const useUpdatePost = (config: any = {}) => {
  const queryClient = useQueryClient();
  const toast = useToast({
    position: 'top-right',
    variant: 'solid',
    isClosable: true,
  });
  return useMutation((payload: any) => updatePost(payload), {
    ...config,
    onMutate: (payload) => {
      // Optimistic update
      toast({ status: 'success', title: `Post "${payload.title}" update` });

      queryClient.cancelQueries(['posts']);
      queryClient.cancelQueries(['post', payload.id]);

      const prevPost = queryClient.getQueryData(['post', payload.id]);

      queryClient.setQueryData(['post', payload.id], (post: any) => ({
        ...post,
        ...payload,
        __offline: true,
      }));

      queryClient.setQueryData(['posts'], (oldData: any) => {
        return {
          ...oldData,
          pages: oldData?.pages?.map((posts) =>
            posts.map((post) =>
              post.id === payload.id
                ? { ...post, ...payload, __offline: true }
                : post
            )
          ),
        };
      });

      config?.onMutate?.(payload);

      return { prevPost };
    },
    onError: (data: any, payload: any, context: any) => {
      toast({
        status: 'error',
        title: `Failed to udpate post ${payload?.title}`,
      });

      queryClient.setQueryData(['post', payload.id], context.prevPost);
      queryClient.setQueryData(['posts'], (oldData: any) => {
        return {
          ...oldData,
          pages: oldData?.pages?.map((posts) =>
            posts.map((post) =>
              post.id === payload.id ? context.prevPost : post
            )
          ),
        };
      });

      config?.onError?.(data, payload, context);
    },
    onSuccess: (data, payload, context: any) => {
      // Update single query
      queryClient.setQueryData(['post', data.id], data);

      // Update post in list with data from the server
      queryClient.setQueryData(['posts'], (oldData: any) => {
        return {
          ...oldData,
          pages: oldData?.pages?.map((posts) =>
            posts.map((post) => (post.id === data.id ? data : post))
          ),
        };
      });
      config?.onSuccess?.(data, payload, context);
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  const toast = useToast({
    position: 'top-right',
    variant: 'solid',
    isClosable: true,
  });
  return useMutation((id: string) => deletePost(id), {
    onMutate: (id) => {
      const post: any = queryClient.getQueryData(['post', id]);
      // Optimistic update
      toast({ status: 'success', title: `Post "${post.title}" deleted` });
      queryClient.cancelQueries(['posts']);
      queryClient.cancelQueries(['post', id]);

      const prevData = queryClient.getQueryData(['posts']);
      queryClient.setQueryData(['posts'], (oldData: any) => {
        return {
          ...oldData,
          pages: oldData?.pages?.map((posts) =>
            posts.filter((post) => post.id !== id)
          ),
        };
      });

      return { prevData };
    },
    onError: (error: AxiosError, id, context: any) => {
      toast({
        status: 'error',
        title: `Failed to delete post "${error.response.data.title}"`,
      });

      // TODO: Improve this if multi updates
      queryClient.setQueryData(['posts'], context.prevData);
    },
  });
};

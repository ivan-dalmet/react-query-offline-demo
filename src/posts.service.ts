import { useToast } from '@chakra-ui/react';
import axios, { AxiosError } from 'axios';
import dayjs from 'dayjs';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import { v4 as uuid } from 'uuid';

const OFFLINE_PREFIX = '__offline__';

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
    enabled: !!id && !id.startsWith(OFFLINE_PREFIX),
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
    onMutate: (data) => {
      // Optimistic update
      const __tempId = `${OFFLINE_PREFIX}${uuid()}`;
      const tempPost = {
        ...data,
        __tempId,
        __offline: true,
        createdAt: dayjs().format(),
      };
      toast({ status: 'success', title: `Post "${data.title}" added` });
      queryClient.cancelQueries(['posts']);

      // Pre populate temporary single query
      queryClient.setQueryData(['post', __tempId], tempPost);

      // Pre populate posts list with temporary data
      queryClient.setQueryData(['posts'], (oldData: any) => {
        return {
          ...oldData,
          pages: [[tempPost], ...(oldData?.pages ?? [])],
        };
      });
      config?.onMutate?.(data);

      return { __tempId };
    },
    onError: (data, payload: any, context: any) => {
      toast({
        status: 'error',
        title: `Failed to create post ${payload?.title}`,
      });
      queryClient.setQueryData(['posts'], (oldData: any) => {
        return {
          ...oldData,
          pages: oldData?.pages?.map((posts) =>
            posts.filter((post) => post.__tempId !== context.__tempId)
          ),
        };
      });
      config?.onError?.(data, payload, context);
    },
    onSuccess: (data, payload, context: any) => {
      // Update temporary single query with data from the server
      queryClient.setQueryData(['post', context.__tempId], data);
      // Pre populate real single query
      queryClient.setQueryData(['post', data.id], data);

      // Update temporary post in list with data from the server
      queryClient.setQueryData(['posts'], (oldData: any) => {
        return {
          ...oldData,
          pages: oldData?.pages?.map((posts) =>
            posts.map((post) =>
              post.__tempId === context.__tempId ? data : post
            )
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
      queryClient.setQueryData(['posts'], (oldData: any) => {
        return {
          ...oldData,
          pages: oldData?.pages?.map((posts) =>
            posts.filter((post) => post.id !== id && post.__tempId !== id)
          ),
        };
      });
    },
    onError: (error: AxiosError) => {
      toast({
        status: 'error',
        title: `Failed to delete post "${error.response.data.title}"`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(['posts']);
    },
  });
};

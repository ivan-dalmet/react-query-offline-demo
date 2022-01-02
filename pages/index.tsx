import { useState } from 'react';

import {
  Box,
  Button,
  Code,
  HStack,
  Heading,
  Input,
  LinkBox,
  LinkOverlay,
  Stack,
  StackProps,
  Text,
  chakra,
} from '@chakra-ui/react';
import Link from 'next/link';

import {
  useCreatePost,
  useDeletePost,
  useInfinitePosts,
} from '@/posts.service';

const CreatePostForm = ({ ...rest }: StackProps) => {
  const [title, setTitle] = useState('');
  const { mutate: createPost } = useCreatePost();

  const handleSubmit = async (e) => {
    e.preventDefault();
    createPost({ title });
    setTitle('');
  };

  return (
    <Stack
      as="form"
      onSubmit={handleSubmit}
      spacing={{ base: 2, sm: 3 }}
      p="4"
      bg="white"
      boxShadow="lg"
      borderRadius="md"
      {...rest}
    >
      <Heading size="sm">New post</Heading>
      <Input
        name="title"
        placeholder="New post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        isRequired
      />
      <Button type="submit" colorScheme="blue">
        Create Post
      </Button>
      <Stack>
        <Text>
          Use{' '}
          <Code
            as="button"
            type="button"
            onClick={() => setTitle('failToCreate')}
          >
            failToCreate
          </Code>{' '}
          for failing post creation.
        </Text>
        <Text>
          Use{' '}
          <Code
            as="button"
            type="button"
            onClick={() => setTitle('failToDelete')}
          >
            failToDelete
          </Code>{' '}
          for failing post deletion.
        </Text>
      </Stack>
    </Stack>
  );
};

export default function IndexPage() {
  const { data, isLoading, isFetchingNextPage, fetchNextPage } =
    useInfinitePosts();

  const { mutate: deletePost } = useDeletePost();

  const loadedPosts = data?.pages?.flat();
  const isEmpty = !loadedPosts?.length && !isLoading;

  return (
    <Stack p="8" spacing="6" minH="100vh" bg="gray.50">
      <Heading>Posts</Heading>
      <Stack
        alignItems="flex-start"
        direction={{ base: 'column', lg: 'row' }}
        spacing="8"
      >
        <CreatePostForm w={{ base: 'full', lg: 'auto' }} />
        <Stack flex="1" w="full">
          {isLoading && <Box>Loading...</Box>}
          {isEmpty && <Box>No posts</Box>}
          {loadedPosts?.map((post) => (
            <LinkBox
              key={post.id ?? post.createdAt}
              spacing="4"
              p="4"
              bg="white"
              boxShadow="xl"
              borderRadius="md"
              outline="none"
              role="group"
            >
              <Stack direction="row" alignItems="center">
                <Link href={`/posts/${post.id ?? post.__tempId}`} passHref>
                  <LinkOverlay
                    d="flex"
                    flex="1"
                    alignItems="center"
                    _groupHover={{ color: 'blue.500' }}
                  >
                    <Stack
                      spacing={{ base: 0, md: 2 }}
                      direction={{ base: 'column', md: 'row' }}
                    >
                      <HStack>
                        <Box
                          flex="none"
                          borderRadius="full"
                          w="2"
                          h="2"
                          bg={post.__offline ? 'orange.500' : 'green.500'}
                        />
                        <Heading size="sm">{post.title} </Heading>{' '}
                      </HStack>
                      {!!post?.id && (
                        <Box ml="1" fontSize="sm">
                          {post.id}
                        </Box>
                      )}
                    </Stack>
                  </LinkOverlay>
                </Link>
                <Button
                  colorScheme="red"
                  variant="outline"
                  size="sm"
                  onClick={() => deletePost(post.id ?? post.__tempId)}
                >
                  Delete
                </Button>
              </Stack>
            </LinkBox>
          ))}
          <Button
            colorScheme="blue"
            isLoading={isFetchingNextPage}
            isDisabled={isEmpty}
            onClick={() => fetchNextPage()}
          >
            Load More
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}

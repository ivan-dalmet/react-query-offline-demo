import { useEffect } from 'react';

import {
  Box,
  Button,
  Code,
  HStack,
  Heading,
  Stack,
  chakra,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useDeletePost, usePost } from '../../src/posts.service';

export default function IndexPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: post, isLoading } = usePost(id?.toString());
  const { mutate: deletePost } = useDeletePost();

  const handleDelete = () => {
    deletePost(id.toString());
    router.replace('/');
  };

  useEffect(() => {
    if (post?.id) {
      router.replace('/posts/' + post?.id);
    }
  }, [post?.id]);

  return (
    <Stack p="8" spacing="6" maxW="4xl" mx="auto">
      <Stack
        direction={{ base: 'column', md: 'row' }}
        alignItems={{ base: 'flex-start', md: 'flex-end' }}
        spacing="2"
      >
        <HStack>
          <Box
            flex="none"
            borderRadius="full"
            w="4"
            h="4"
            bg={post?.__offline ? 'orange.500' : 'green.500'}
            d="inline-flex"
          />
          <Heading size="lg">Post "{post?.title}"</Heading>
        </HStack>
        {!!post?.id && <Box fontSize="md">{post.id}</Box>}
      </Stack>
      <Link href="/" passHref>
        <Button as="a">All Posts</Button>
      </Link>

      <Box>{isLoading && 'Loading...'}</Box>
      <Code as="pre" w="full" overflow="auto">
        {JSON.stringify(post, null, 2)}
      </Code>
      <Button colorScheme="red" variant="outline" onClick={handleDelete}>
        Delete
      </Button>
    </Stack>
  );
}

import { useState } from 'react';

import {
  Box,
  Button,
  ButtonGroup,
  Code,
  HStack,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useDeletePost, usePost, useUpdatePost } from '@/posts.service';

const UpdatePostForm = ({ post, onClose, ...rest }) => {
  const [title, setTitle] = useState(post.title);
  const { mutate: updatePost } = useUpdatePost({
    onMutate: () => {
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updatePost({ id: post.id, title });
  };

  return (
    <Modal isOpen onClose={onClose}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Update Post Title</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={{ base: 2, sm: 3 }} {...rest}>
            <Input
              name="title"
              placeholder="Post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              isRequired
              autoFocus
            />
            <Stack>
              <Text>
                Use{' '}
                <Code
                  as="button"
                  type="button"
                  onClick={() => setTitle('failToUpdate')}
                >
                  failToUpdate
                </Code>{' '}
                for failing post update.
              </Text>
            </Stack>
          </Stack>
        </ModalBody>

        <ModalFooter justifyContent="space-between">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" colorScheme="blue">
            Update Title
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default function PostPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: post, isLoading } = usePost(id?.toString());
  const { mutate: deletePost } = useDeletePost();
  const {
    isOpen: isUpdateOpen,
    onClose: onUpdateClose,
    onOpen: onUpdateOpen,
  } = useDisclosure();

  const handleDelete = () => {
    deletePost(id.toString());
    router.replace('/');
  };

  return (
    <Stack p="8" spacing="6" maxW="4xl" mx="auto">
      <Stack direction="column" alignItems="flex-start" spacing="2">
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
      <ButtonGroup>
        <Button colorScheme="blue" onClick={onUpdateOpen}>
          Update title
        </Button>
        <Button colorScheme="red" variant="outline" onClick={handleDelete}>
          Delete
        </Button>
      </ButtonGroup>
      {!isLoading && !!post && isUpdateOpen && (
        <UpdatePostForm onClose={onUpdateClose} post={post} />
      )}
      <Code as="pre" w="full" overflow="auto">
        {JSON.stringify(post, null, 2)}
      </Code>
    </Stack>
  );
}

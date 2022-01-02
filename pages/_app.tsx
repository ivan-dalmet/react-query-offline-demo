import { useEffect } from 'react';

import { ChakraProvider } from '@chakra-ui/react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createWebStoragePersister } from 'react-query/createWebStoragePersister';
import { ReactQueryDevtools } from 'react-query/devtools';
import { persistQueryClient } from 'react-query/persistQueryClient';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: Infinity,
    },
  },
});

function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const localStoragePersister = createWebStoragePersister({
      storage: window.localStorage,
    });

    persistQueryClient({
      queryClient,
      persister: localStoragePersister,
    });
  }, []);
  return (
    <>
      <Head>
        <title>React Query Offline Demo</title>
      </Head>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <Component {...pageProps} />
        </ChakraProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </>
  );
}

export default App;

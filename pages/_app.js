import '../styles/globals.css'
import Amplify from 'aws-amplify'
import config from '../src/aws-exports'

import { ChakraProvider } from '@chakra-ui/react'
import theme from '../components/theme'

Amplify.configure({ ...config, ssr: true })

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default MyApp

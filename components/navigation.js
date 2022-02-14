import {
    Container,
    Box,
    Button,
    Stack,
    Heading,
    Flex,
    Menu,
    MenuItem,
    MenuList,
    MenuButton,
    IconButton,
    useColorModeValue,
    useColorMode,
} from '@chakra-ui/react'

import Link from './BestLink'

import { Auth } from 'aws-amplify'



const Navigation = () => {

    // async function signOut() {
    //     try {
    //         await Auth.signOut();
    //     } catch (error) {
    //         console.log('error signing out: ', error);
    //     }
    // }

    const { colorMode, toggleColorMode } = useColorMode()

    return (
        <Box w="100%" display="flex" justifyContent="space-between" pos="fixed" top="0" bg={useColorModeValue('gray.200', 'gray.900')} py="3" zIndex={9999}>
            <Heading>chatapp</Heading>
            <Stack display="flex">
                {/* <Button onClick={() => signOut()}><Link href="/">サインアウト</Link></Button> */}
                <Link href={'/sample'}>
                    <Button>test</Button>
                </Link>
                <Button onClick={toggleColorMode}>
                    Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
                </Button>
            </Stack>
        </Box>
    )
}

export default Navigation
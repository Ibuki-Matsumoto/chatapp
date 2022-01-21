import {
    Container,
    Box,
    Link,
    Stack,
    Heading,
    Flex,
    Menu,
    MenuItem,
    MenuList,
    MenuButton,
    IconButton,
    useColorModeValue,
    useColorMode, Button
} from '@chakra-ui/react'

const Navigation = () => {

    const { colorMode, toggleColorMode } = useColorMode()

    return (
        <Box w="100%" display="flex" justifyContent="space-between" pos="fixed" top="0" bg={useColorModeValue('gray.200', 'gray.900')} py="3" zIndex={9999}>
            <Heading>chatapp</Heading>
            <Button onClick={toggleColorMode}>
                Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
            </Button>
        </Box>
    )
}

export default Navigation
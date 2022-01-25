import React from "react";

import { Stack, Box, Divider, Text } from "@chakra-ui/react";

export default function Message({ message }) {

    let DateTime = message.createdAt

    return (
        <Box mt={3}>
            <Text mb={1} fontSize="sm">{message.owner}</Text>
            <Stack>
                <Text fontSize="xl">{message.message}</Text>
                <Text fontSize="sm">{DateTime}</Text>
            </Stack>
            <Divider color="red.800" mt={3} />
        </Box>
    );
}
import React from "react";

import { Stack, Box, Divider, Text } from "@chakra-ui/react";

export default function Message({ message, isMe }) {
    return (
        <Box mt={3}>
            <Text mb={1} fontSize="sm">{message.owner}</Text>
            <Stack>
                <Text fontSize="xl">{message.message}</Text>
            </Stack>
            <Divider color="red.800" mt={3} />
        </Box>
    );
}
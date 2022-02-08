import React, { useEffect, useState } from "react";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { API, Auth, withSSRContext, graphqlOperation } from "aws-amplify";
import { listMessages } from "../src/graphql/queries";
import { createMessage } from "../src/graphql/mutations";
import Message from "../components/message";
import { onCreateMessage } from "../src/graphql/subscriptions";
import Navigation from "../components/navigation";
import '@aws-amplify/ui-react/styles.css';

import { Box, Center, Input, Flex, useColorModeValue } from '@chakra-ui/react'


function Home({ messages }) {
  const [stateMessages, setStateMessages] = useState([...messages]);
  const [messageText, setMessageText] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const amplifyUser = await Auth.currentAuthenticatedUser();
        setUser(amplifyUser);
      } catch (err) {
        setUser(null);
      }
    };

    fetchUser();

    const subscription = API.graphql(
      graphqlOperation(onCreateMessage)
    ).subscribe({
      next: ({ provider, value }) => {
        setStateMessages((stateMessages) => [
          ...stateMessages,
          value.data.onCreateMessage,
        ]);
      },
      error: (error) => console.warn(error),
    });
  }, []);

  useEffect(() => {
    async function getMessages() {
      try {
        const messagesReq = await API.graphql({
          query: listMessages,
          authMode: "AMAZON_COGNITO_USER_POOLS",
        });
        setStateMessages([...messagesReq.data.listMessages.items]);
        const main = document.getElementById("scroll-inner");
        console.log(main)

      } catch (error) {
        console.error(error);
      }
    }
    getMessages();
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessageText("");

    const input = {
      message: messageText,
      owner: user.username,
    };

    try {
      await API.graphql({
        authMode: "AMAZON_COGNITO_USER_POOLS",
        query: createMessage,
        variables: {
          input: input,
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (user) {
    return (
      <Flex direction="column">
        <Navigation />
        {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
        <Box w="100%" bg={useColorModeValue('white', 'gray.700')}>
          <Box overflow="scroll" my="80px" id="scroll-inner">
            {stateMessages
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((message) => (
                <Message
                  message={message}
                  user={user}
                  isMe={user.username === message.owner}
                  key={message.id}
                />
              ))}
          </Box>
          {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
          <Box w="100%" h="80px" bg={useColorModeValue('gray.200', 'gray.900')} pos="fixed" bottom="0" zIndex={9999}>
            <Box w="100%" h="80px" display="flex" alignItems="center">
              <form onSubmit={handleSubmit} style={{ display: "flex", width: "90%", justifyContent: "space-between", margin: "auto", alignItems: "center" }}>
                <Input
                  w="70%"
                  size="lg"
                  type="text"
                  id="message"
                  name="message"
                  autoFocus
                  required
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="メッセージを入力してください..."
                />
                <button>Send</button>
              </form>
            </Box>
          </Box>
        </Box>
      </Flex >
    );
  } else {
    return <p>Loading...</p>;
  }
}

export default withAuthenticator(Home);

export async function getServerSideProps({ req }) {
  const SSR = withSSRContext({ req });

  try {
    const user = await SSR.Auth.currentAuthenticatedUser();

    const response = await SSR.API.graphql({
      query: listMessages,

      authMode: "AMAZON_COGNITO_USER_POOLS",
    });

    return {
      props: {
        messages: response.data.listMessages.items,
      },
    };
  } catch (error) {
    return {
      props: {
        messages: [],
      },
    };
  }
}
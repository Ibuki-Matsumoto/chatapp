import React, { useEffect, useState } from "react";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { API, Auth, withSSRContext, graphqlOperation } from "aws-amplify";
import { listMessages } from "../src/graphql/queries";
import { createMessage } from "../src/graphql/mutations";
import Message from "../components/message";
import { onCreateMessage } from "../src/graphql/subscriptions";
import Navigation from "../components/navigation";

import { Box, Center, Input, Flex, useColorModeValue } from '@chakra-ui/react'


function Home({ messages }) {
  const [stateMessages, setStateMessages] = useState([...messages]);
  const [messageText, setMessageText] = useState("");
  const [user, setUser] = useState(null);

  function scrollToEnd() {
    const messagesArea = document.getElementById('scroll-inner');
    window.scroll(0, messagesArea.scrollHeight)
  }

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

    // Subscribe to creation of message
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
      } catch (error) {
        console.error(error);
      }
    }
    getMessages();
  }, [user]);

  const handleSubmit = async (event) => {
    // Prevent the page from reloading
    event.preventDefault();

    // clear the textbox
    setMessageText("");

    const input = {
      // id is auto populated by AWS Amplify
      message: messageText, // the message content the user submitted (from state)
      owner: user.username, // this is the username of the current user
    };

    // Try make the mutation to graphql API
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
              // sort messages oldest to newest client-side
              .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
              .map((message) => (
                // map each message into the message component with message as props
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
                <button onClick={scrollToEnd()}>Send</button>
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
  // wrap the request in a withSSRContext to use Amplify functionality serverside.
  const SSR = withSSRContext({ req });

  try {
    // currentAuthenticatedUser() will throw an error if the user is not signed in.
    const user = await SSR.Auth.currentAuthenticatedUser();

    // If we make it passed the above line, that means the user is signed in.
    const response = await SSR.API.graphql({
      query: listMessages,
      // use authMode: AMAZON_COGNITO_USER_POOLS to make a request on the current user's behalf
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });

    // return all the messages from the dynamoDB
    return {
      props: {
        messages: response.data.listMessages.items,
      },
    };
  } catch (error) {
    // We will end up here if there is no user signed in.
    // We'll just return a list of empty messages.
    return {
      props: {
        messages: [],
      },
    };
  }
}
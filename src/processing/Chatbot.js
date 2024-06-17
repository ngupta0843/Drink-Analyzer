import React, { useState } from "react";
import axios from "axios";
import { Box, Button, TextField, Typography, Chip } from "@mui/material";

const Chatbot = ({ productInfo }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (messageContent) => {
    if (!messageContent.trim()) return;

    setLoading(true);

    const userMessage = { role: "user", content: messageContent };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const format = [
      {
        question: `Please provide a follow up question related to the ${productInfo.product_name} question that the user may ask you and is not more 20 letters.`,
      },
    ];

    const prompt = `Answer the user's question only if it is about ${
      productInfo.product_name
    }. Assume that any question asked is about ${
      productInfo.product_name
    }. Make sure that answers are short and concise. At the end of the response, include follow up questions in the following JSON format: ${JSON.stringify(
      format
    )}`;

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [{ role: "system", content: prompt }, userMessage],
        },
        {
          headers: {
            Authorization: `API_KEY`,
            "Content-Type": "application/json",
          },
        }
      );

      let botMessageContent = response.data.choices[0].message.content;

      const followUpJsonMatch = botMessageContent.match(/\[(.*?)\]/);
      if (followUpJsonMatch) {
        const followUpData = JSON.parse(followUpJsonMatch[0]);
        setFollowUpQuestions(followUpData);

        botMessageContent = botMessageContent
          .replace(followUpJsonMatch[0], "")
          .trim();
      } else {
        setFollowUpQuestions([]);
      }

      const botMessage = {
        role: "assistant",
        content: botMessageContent,
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error communicating with the chatbot:", error);
    }

    setLoading(false);
    setInput("");
  };

  const handleTagClick = (question) => {
    sendMessage(question);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          border: "1px solid #ccc",
          borderRadius: 3,
          padding: 2,
          height: 300,
          overflowY: "scroll",
          position: "relative",
          mb: 2,
        }}
      >
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              mb: 1,
            }}
          >
            <Box
              sx={{
                maxWidth: "75%",
                padding: 1,
                borderRadius: 2,
                backgroundColor: msg.role === "user" ? "#cfe9ff" : "#e0e0e0",
                color: "black",
              }}
            >
              <Typography variant="body1">{msg.content}</Typography>
            </Box>
          </Box>
        ))}
        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              mb: 1,
            }}
          >
            <Box
              sx={{
                maxWidth: "75%",
                padding: 1,
                borderRadius: 2,
                backgroundColor: "#e0e0e0",
                color: "black",
              }}
            >
              <Typography variant="body1">
                Loading<span>.</span>
                <span>.</span>
                <span>.</span>
              </Typography>
            </Box>
          </Box>
        )}
        <Box
          sx={{
            mt: 2,
            display: "flex",
            alignItems: "center",
            position: "absolute",
            bottom: "0px",
          }}
        >
          {followUpQuestions.map((questionObj, index) => (
            <Chip
              key={index}
              label={questionObj.question}
              onClick={() => handleTagClick(questionObj.question)}
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ display: "flex" }}>
        <TextField
          variant="outlined"
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          sx={{ mr: 1 }}
        />
        <Button
          variant="contained"
          onClick={() => sendMessage(input)}
          disabled={loading}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default Chatbot;

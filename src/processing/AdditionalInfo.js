import React, { useState, useEffect } from "react";
import axios from "axios";
import { CircularProgress } from "@mui/material";

const AdditionalInfo = ({ product }) => {
  const prompt = `What are additional products similar to ${product}?`;
  const [response, setResponse] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getAdditionalInfo = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4",
            messages: [{ role: "system", content: prompt }],
          },
          {
            headers: {
              Authorization: `API-KEY`,
              "Content-Type": "application/json",
            },
          }
        );
        let additionalInfo = response.data.choices[0].message.content;
        setLoading(false);
        setResponse(additionalInfo);
      } catch (error) {
        console.log(error);
      }
    };

    getAdditionalInfo();
  }, []);

  return (
    <div>
      {loading && <CircularProgress />}
      {response}
    </div>
  );
};

export default AdditionalInfo;

import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Box,
  Typography,
  Paper,
  Container,
  Slider,
} from "@mui/material";
import BarcodeScanner from "./scanner/Scanner";
import Chatbot from "./processing/Chatbot";
import AdditionalInfo from "./processing/AdditionalInfo";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#03a9f4", // light blue color
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
});

const App = () => {
  const [productInfo, setProductInfo] = useState(null);
  const [camera, setCamera] = useState(false);

  const handleDetectedBarcode = (barcode) => {
    axios
      .get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
      .then((response) => {
        const { product } = response.data;
        if (product) {
          setProductInfo(product);
          console.log(product);
          setCamera(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching product data:", error);
        alert("Failed to fetch product details.");
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" style={{ marginTop: "20px" }}>
        <Box display="flex" justifyContent="center" flexDirection="row" gap={2}>
          <Paper style={{ padding: "20px", width: "100%" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setCamera(!camera)}
            >
              {camera ? "Stop" : "Scan"}
            </Button>
            {camera && <BarcodeScanner onDetected={handleDetectedBarcode} />}
            <Typography variant="h5" component="h2" gutterBottom>
              {productInfo?.product_name}
            </Typography>
            <img
              src={productInfo?.image_url}
              alt={productInfo?.product_name}
              style={{ width: "auto", height: "200px" }}
            />
            <Typography variant="body1">
              {productInfo?.ingredients_text}
            </Typography>
          </Paper>
          {productInfo && (
            <Paper style={{ padding: "20px", width: "100%" }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Chatbot
              </Typography>
              <Chatbot productInfo={productInfo} />
            </Paper>
          )}
        </Box>
        {productInfo && (
          <Box
            display="flex"
            justifyContent="center"
            flexDirection="row"
            gap={2}
          >
            <Typography
              variant="h6"
              component="h3"
              gutterBottom
              sx={{ marginTop: "2vh" }}
            >
              Additional Options for this product:{" "}
              <AdditionalInfo product={productInfo?.product_name} />
            </Typography>
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default App;

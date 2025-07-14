require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const PORT = 3000;
const URL = "http://20.244.56.144/evaluation-service/logs";

app.post('/logs-helper', async (req, res) => {
    try {
        const { stack, level, package, message } = req.body;

        const resp = await axios.post(URL, { stack, level, package, message });
        res.status(200).json({ status: "success", data: resp.data });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

app.listen(PORT, () => {
    console.log("Server is running on port :" + PORT);
});

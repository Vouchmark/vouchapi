require("dotenv").config();
var axios = require("axios").default;
const express = require("express");
const app = express();

secret__key = process.env.SECRET_KEY;
port = process.env.PORT;

app.get("/vouchlookup", (req, res) => {
  const searchId = req.query.search;

  var options = {
    method: "GET",
    url: "https://api.withmono.com/v3/lookup/cac",
    params: { search: searchId },
    headers: {
      Accept: "*/*",
      "mono-sec-key": secret__key,
    },
  };

  axios
    .request(options)
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.listen(port, () =>
  console.log(`Server started on PORT: http://localhost:${port}`)
);

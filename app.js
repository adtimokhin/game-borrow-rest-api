const express = require("express");
const app = express();


app.use((err, req, res, next) => {
    console.log("err :>> ", err);
    const status = err.statusCode || 500;
    const message = err.message;
    const data = err.data;
    res.status(status).json({ message: message, data: data });
  });


app.listen(process.env.PORT || 8080);
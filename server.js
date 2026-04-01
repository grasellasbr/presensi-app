const express = require('express');
const app = express();
const fs = require('fs');

app.use(express.json());
app.use(require('cors')());

app.post('/absen', (req, res) => {
  const data = req.body;

  let database = [];

  if (fs.existsSync('data.json')) {
    database = JSON.parse(fs.readFileSync('data.json'));
  }

  database.push(data);

  fs.writeFileSync('data.json', JSON.stringify(database, null, 2));

  res.send({ message: "Absen berhasil!" });
});

app.listen(3000, () => console.log("Server jalan di http://localhost:3000"));
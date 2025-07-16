const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

//임시 데이터베이스(게시글 저장할 배열)

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
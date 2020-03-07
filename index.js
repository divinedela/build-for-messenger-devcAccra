
const express = require("express");
const app = express();
app.use(express.json());


const port = 3000;
app.listen(port, () => console.log(`App listening on port ${port}!`));

app.get('/', (request, response) => {
    response.send({message: 'Welcome!'});
});


const app = require('./server');
const port = process.env.SERVER_PORT || 8080;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const PORT = process.env.PORT || 8080
const app = require("./app/src")
app.listen(PORT,()=>console.log(`http://localhost:${PORT}`))



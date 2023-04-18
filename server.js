const mongoose = require("mongoose")
const Document = require("./Document")
const dotenv = require("dotenv")
dotenv.config()
mongoose
  .connect(process.env.URI)
const io = require("socket.io")(3001, {
  // require the socket.io and giving them 3001 port
  cors: {
    // cors object that have origin and methods property
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})
// io.on method that have connection and callback function
io.on("connection", (socket) => {
  socket.on("document-id", async (documentId) => {
    const document = await findOrCreateDocument(documentId)
    socket.join(documentId)
    socket.emit("load-document", document.data)
    socket.on("send-changes", (delta) => {
      // another socket on method that send-changes and get the delta
      socket.broadcast.to(documentId).emit("receive-changes", delta)
    })
    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(documentId, {data})
    })
  })
  console.log("connected.")
})
const defaultValue = ""
async function findOrCreateDocument(id) {
  // if (id == null) return
  const document = await Document.findById(id)
  if (document) return document
  return Document.create({_id: id, data: defaultValue})
}

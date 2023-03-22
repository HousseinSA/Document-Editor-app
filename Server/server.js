const mongoose = require("mongoose")
const Document = require("./Document")
console.log(Document)
mongoose.connect("mongodb://localhost/google-docs")
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
  // socket function is connection between server and client.
  socket.on("get-document", (documentID) => {
    // function to get documentID
    const document =findOrCreateDocument(documentID)
    // method to join socket with to documentId
    socket.join(documentID)
    // socket emit method to load data
    socket.emit("load-document", document.data)
    socket.on("send-changes", (delta) => {
      // another socket on method that send-changes and get the delta
      socket.broadcast.to(documentID).emit("receive-changes", delta)
      // socket broadcast and to documentId emit more and recieve-changes delta.
    })
    // socket event to save document changes to mongodb
    socket.on("save-document",async data=>{
      await Document.findByIdAndUpdate(documentID,{data})
    })
  })
  console.log("connected.")
})
const defautlValue = ""
// function to find or create document in data base
async function findOrCreateDocument(id) {
  if (id === null) return
  const document = await Document.findById(id)
  if (document) return document
  return await Document.create({_id: id, data: defautlValue})
}

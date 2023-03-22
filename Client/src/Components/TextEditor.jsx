import React, {useCallback, useEffect, useState} from "react"
import "quill/dist/quill.snow.css"
import Quill from "quill"
import {io} from "socket.io-client"
import {useParams} from "react-router-dom"
export default function TextEditor() {
  // adding use states for the socket and quill to get there values
  const [socket, setSocket] = useState()
  const [quill, setQuill] = useState()
  // getting the params id
  const {id: documentID} = useParams()
  // adding more option to quill toolbar
  const toolbar_options = [
    [{header: [1, 2, 3, 4, 5, 6, false]}],
    [{font: []}],
    [{list: "ordered"}, {list: "bullet"}],
    ["bold", "italic", "underline"],
    [{color: ["red", "yellow"]}, {background: []}],
    [{script: "sub"}, {script: "super"}],
    [{align: []}],
    ["image", "blockquote", "code-block"],
    ["clean"],
  ]
  // make change for first mount and conecting to server and adding it to socket and clean up
  useEffect(() => {
    const s = io("http://localhost:3001")
    setSocket(s)
    return () => s.disconnect()
  }, [])
  // callback hook to add the editor to container div
  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return
    // emty string in start
    wrapper.innerHTML = ""
    // creating div
    const editor = document.createElement("div")
    // adding div to wrapper
    wrapper.append(editor)
    // creating new quill editor
    const q = new Quill(editor, {
      theme: "snow",
      modules: {toolbar: toolbar_options},
    })
    // disable quil when the id is diffrent
    q.disable()
    q.setText("Loading...")
    // adding q to quill state
    setQuill(q)
  }, [])
  useEffect(() => {
    // codition to make sure that socket and quill is null then do nothing
    if (socket == null || quill == null) return
    // handler function that have sourcce and delta
    const handler = (delta, oldDelta, source) => {
      // condition if source is not the user then do nothing
      if (source !== "user") return
      // if it's the user then emit socket to server delta changes
      socket.emit("send-changes", delta)
    }
    // quill event listner if the text change then call the handler function
    quill.on("text-change", handler)
    return () => {
      // cleaning up the quill eventListner
      quill.off("text-change", handler)
    }
  }, [socket, quill])
  useEffect(() => {
    // same with the other useEffect
    if (socket == null || quill == null) return
    const handler = (delta) => {
      // this handler function update the content on both spaces.
      quill.updateContents(delta)
    }
    // socket eventListner to to get changes then call handler function to make changes to spaces.
    socket.on("receive-changes", handler)
    return () => {
      // cleaning up the socket eventListner
      socket.off("receive-changes", handler)
    }
  }, [socket, quill])
  useEffect(() => {
    // the same as other useEffect
    if (socket == null || quill == null) return
    // onetime eventListner to load-document then change quill content to the document
    socket.once("load-document", (document) => {
      quill.setContents(document)
      // and enabling quill
      quill.enable()
    })
    // socket emit to get_docuemtn id to make changes to server based on documentId
    socket.emit("get-document", documentID)
  }, [socket, quill, documentID])
  // return div container and all the editor content.

  // useEffect to save the quill changes to database
  useEffect(() => {
    if (socket == null || quill == null) return
    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents())
    }, 2000)
    return ()=> clearInterval(interval  )
  }, [quill, socket])
  return <div className="container" ref={wrapperRef}></div>
}

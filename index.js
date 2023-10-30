import express from "express"
import morgan from "morgan"
import cors from "cors"

const PORT = 3001

let notes = [
    {
        id: 1,
        content: `1`,
        important: true
    },
    {
        id: 2,
        content: `2`,
        important: false
    },
    {
        id: 3,
        content: `3`,
        important: true
    }
]

const app = express()


const request_logger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}


const morgan_logger = (tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, "content-length"),
        "-",
        tokens["response-time"](req, res),
        "ms",
        JSON.stringify(req.body)
    ].join(" ")
}


app.use(express.static("build"), express.json(), morgan(morgan_logger), cors())


app.head("/", (request, response) => {
    console.log(response.getHeaders())
    response.end()
})

app.get("/", (request, response) => {
    response.send("hello there")
})

app.get("/api/notes", (request, response) => {
    response.json(notes)
})

app.get("/api/notes/:id", (request, response) => {
    const id = Number(request.params.id)
    const note = notes.find(note => note.id === id)
    if (note) {
        response.json(note)
    } else {
        response.status(404)
        response.statusMessage = "Note does not exist"
        response.end()
    }
})

app.delete("/api/notes/:id", (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(note => note.id != id)
    response.status(204)
    response.statusMessage = `Note deleted`
    response.end()
})

app.post("/api/notes", (request, response) => {
    let new_note_id = notes.length > 0 ?
        Math.max(...notes.map(n => n.id)) + 1
        : 0

    const body = request.body

    if (!body.content) {
        return response.status(404).json({"error": "missing content"})
    }

    const note = {
        content: body.content,
        important: body.important || false,
        id: new_note_id
    }


    notes = notes.concat(note)

    response.json(note)
})

app.put("/api/notes/:id", (request, response) => {
    const note_id = Number(request.params.id)
    const body = request.body
    const updated_note = {
        id: note_id,
        content: body.content,
        important: body.important || false
    }

    notes = notes.filter(n => n.id !== note_id)
    notes = notes.concat(updated_note)
    response.json(updated_note)
})

const unknown_endpoint = (request, response) => {
    response.status(404).json({"message": "unknown endpoint"})
}

app.use(unknown_endpoint)

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`)
})

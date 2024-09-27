import express from "express"
import userRouter from './routes/user.router.js'
import roleRouter from './routes/role.router.js'
import cookieParser from "cookie-parser"

const app = express()

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())


app.use("/api/users", userRouter)
app.use("/api/role", roleRouter)

export { app }
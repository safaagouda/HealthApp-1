require('dotenv').config()
require('../app/database/connection')
const cors = require('cors')
const express = require("express")
const app=express()
const path =require("path")



const staticDir = path.join(__dirname,"../public")
app.use(express.static(staticDir))
app.use(cors())
app.use(express.urlencoded({extended:true}))
app.use(express.json())

const clinicRoutes = require("../routes/doctor.api")
app.use("/doctor",clinicRoutes)

const userRoutes = require("../routes/user.api")
app.use("/user",userRoutes)



module.exports =app
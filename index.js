const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors')
require('dotenv').config()

//middleware
app.use(cors())
app.use(express.urlencoded({ extended: true}));
app.use(express.static('public'))




//user schema
const Schema = mongoose.Schema
const usernameSchema = new Schema({
  username:{
        type:String,   
    }
})
let usermodel = mongoose.model('user', usernameSchema)
//exercise schema
const exerciseSchema = new Schema({
userid:{
  type:String
},
  description:{
      type:String
    },
  duration:{
    type:Number
  },
  date:{
    type:Date
  }
})
let exercisemodel = mongoose.model('ExerciseDaily', exerciseSchema)
mongoose.connect(process.env.MONGO_URL)




//get
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.get('/api/users', async(req,res)=>{
  let users = await usermodel.find({})
  res.json(users)
})
app.get("/api/users/:_id/logs",async(req,res)=>{
  let _id = req.params._id 
  let {from,to,limit} = req.query

 let dateObj = {}
 
 if(from){
  dateObj['$gte'] = new Date(from)
 }
 if(to){
  dateObj['$lte'] = new Date(to)
 }

 let filter = {userid:_id}
if(from || to){
filter.date = dateObj

}


  let allexercise = await exercisemodel.find(filter).limit(+limit??500)
  console.log(allexercise)
  let user = await usermodel.findById(_id)
 
  const log = allexercise.map((item)=>({
    description:item.description,
    duration:item.duration,
    date:item.date.toDateString()
  }))
  res.json({username:user.username,_id:user._id,count:allexercise.length,log})
})

app.post('/api/users',async(req,res)=>{
 
  let createUsername = await usermodel.create({username:req.body.username})
  res.json(createUsername)

})

app.post('/api/users/:_id/exercises',async(req,res)=>{
  const{description,duration,date} = req.body
let id = req.params._id
const user = await usermodel.findById(id)
  let exercise = await exercisemodel.create({description,duration,date: date  ? new Date(date) : new Date(),userid:user._id})
  res.json({
    username:user.username,
    description:exercise.description,
    duration:exercise.duration,
    date:new Date(exercise.date).toDateString(),
    _id:user._id
  })
  
})




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

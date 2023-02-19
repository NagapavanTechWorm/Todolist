const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {useNewUrlParser: true});
mongoose.set("strictQuery",true);
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const items = ["Enter your goal of the day","Delete to click"];
const workItems = [];
let checkBoxValue;
let para, listname;

const todolistschema = new mongoose.Schema({
  name : String
});
const Todolist = mongoose.model("Todolist",todolistschema);
const list1 = new Todolist({
  name :"Welcome to Todolist"
});
const list2 = new Todolist({
  name :"Click to delete"
});
const todolistarr = [list1,list2];

const listschema = new mongoose.Schema({
  name : String,
  items : [todolistschema]
});
const List = mongoose.model("List",listschema);


app.get("/", function(req, res) {
const day = date.getDate();
Todolist.find({},function(err,founditem){
  if(!err){
    if(founditem.length === 0){
      Todolist.insertMany(todolistarr,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("successful")
        }
      });     
      res.redirect("/");
    }
    else{
      res.render("list",{listTitle: "Today", newListItems: founditem});
    }
  }
});
});

app.get("/:parameter",function(req,res){
  para = _.capitalize(req.params.parameter);
  List.findOne({name:para},function(err,listFound){
      if(!err){
        if(!listFound){
          const list = new List({
            name : para,
            items : todolistarr
          });
          list.save();
          res.redirect("/"+para);
        }
        else{           
          res.render("list",{listTitle: listFound.name, newListItems: listFound.items});
        }
      }
  });
});

app.post("/", function(req, res){
  const itemName = req.body.newItem; 
  const listName = req.body.list; 
  const item = new Todolist({
    name : itemName
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundlist){
      if(!err){
        foundlist.items.push(item);
        foundlist.save();
        res.redirect("/" + listName);
      }
    });
  }
});

app.post("/delete",function(req,res){
  checkBoxValue = req.body.checkbox; 
  listname = req.body.listName;

  if(listname === "Today"){
  Todolist.deleteOne({_id:checkBoxValue},function(err){
    if(!err){
      console.log("deleted");
    }
    res.redirect("/");
  });
  }
  else{
    List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkBoxValue}}},function(err){
      if(!err){
        console.log("deleted");
      }
      res.redirect("/"+listname);
    });
  }

});



app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require('mongoose');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-Mushroom:todolist123@cluster0.kkhmb.mongodb.net/todolistDB', {useNewUrlParser:true});

const itemSchema = {
  name: String
}

const Item = mongoose.model('Item', itemSchema);

const item1 = new Item ({
    name: 'Welcome to the too doo list'
});

const item2 = new Item ({
    name: 'Hit the + button to add a new item'
});

const item3 = new Item ({
    name: '<---Hit this to delete an item '
  });

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items : [itemSchema]
};

const List = mongoose.model('List', listSchema);

app.get("/", function(req, res) {

  Item.find({}, (err, foundItems) =>{
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if(err) console.log(err);
        else console.log('Successfully saved data in db');
      });
      res.redirect('/');
    } else {
        res.render("list", {listTitle: 'Today', newListItems: foundItems});
    }
  });

});

app.get('/:customListName', (req,res) =>{
  function capitalize(str){
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }
  const customListName =capitalize(req.params.customListName);

  List.findOne({name:customListName}, (err, foundList) =>{
    if (!err) {
      if(!foundList){
      const list = new List({
          name : customListName,
          items: defaultItems
        })
        list.save();
        res.redirect('/' + customListName)
      } else {
        res.render('list', {listTitle: customListName, newListItems: foundList.items});
      }
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name : itemName
  });

  if (listName === 'Today') {
    item.save();
    res.redirect('/');
  } else {
    List.findOne({name: listName}, (err, foundList) => {
        foundList.items.push(item);
        foundList.save();
        res.redirect('/'+ listName);
    });
  }

});


app.post('/delete', (req,res) =>{
  const checkedItemId = req.body.checkbox;
  const checkedList = req.body.checkedlist;

  if (checkedList === 'Today') {
    Item.findByIdAndRemove({_id:checkedItemId}, (err) => {
      if (!err) {
         console.log('Successfully removed');
        res.redirect('/');
      }
    });
  }  else {
    List.findOneAndUpdate({name: checkedList}, {$pull: {items:{_id: checkedItemId}}}, (err, updateItems) =>{
      if(!err) res.redirect('/'+ checkedList)
    });
  }

});


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});

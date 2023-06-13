//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://khuranavaibhav428:cogcZizdByG2giIt@cluster0.uv6xk8j.mongodb.net/todolistDB', { useNewUrlParser: true });
const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please check your data entry"]
  }
});
const Item = mongoose.model("Item", itemsSchema);
const buyFood = new Item({
  name: "Buy Food"
});
const cookFood = new Item({
  name: "Cook Food"
});
const EatFood = new Item({
  name: "Eat Food"
});
const defaltItems = [buyFood, cookFood, EatFood];

const listSchema = {
  name: String,
  items : [itemsSchema]
};
const List = mongoose.model("List", listSchema);
app.get("/", function (req, res) {

  Item.find().then(function (foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaltItems).then(function () {
        console.log("Successfully saved defult items to DB");
      }).catch(function (err) {
        console.log(err);
      });
      res.redirect("/");
    } else
    {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
    
  }).catch(function (err) {
    console.log(err);
  });


});

app.get("/:customListName",function (req,res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName}).then(function (foundList) {
    if (!foundList) {
      // create a new list
      const list =new List({
        name : customListName,
        items : defaltItems
      });
      list.save();
      res.redirect("/"+ customListName);
    }
    else{
      res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
    }
    }).catch(function (err) {
        console.log(err);
    });

 
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  }); 
  if (listName === "Today" ) {
    item.save();
  res.redirect("/");
  } else {
    List.findOne({name:listName}).then(function (foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
      }).catch(function (err) {
          console.log(err);
      });
  }
  
});
app.post("/delete", function (req,res) {
  const checkedItem =req.body.checkbox;
  const listName =req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItem).then(function () {
      console.log("Successfully delete the item");
      res.redirect("/");
    }).catch(function (err) {
      console.log(err);
    });
  }
  else
  {
    List.findOneAndUpdate({name : listName}, {$pull: {items:{_id : checkedItem}}}).then(function (foundList) {
      res.redirect("/"+ listName);
      }).catch(function (err) {
          console.log(err);
      });
  }
})


app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const date = require(__dirname + "/date.js")
const _ = require("lodash");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


// mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true });
mongoose.connect("mongodb+srv://admin-pulindu:Pulli269@cluster0.2vtgg4r.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = {
    name: String
}

const Item = new mongoose.model("Item", itemsSchema);

const welcome = new Item({
    name: "Welcome to your ToDoList !!!"
});
const add = new Item({
    name: "Press + to Add new items."
});
const remove = new Item({
    name: "<-- Hit this to remove an item."
});

const defaultItems = [welcome, add, remove];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = new mongoose.model("List", listSchema);

const currentDay = "Today";
app.get("/", function (req, res) {
    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Success, Add default items.");
                }
            });
            res.redirect("/")
        } else {
            res.render("list", { listTitle: currentDay, newItem: foundItems });
        }

    });
});
app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render("list", { listTitle: foundList.name, newItem: foundList.items });
            }
        }
    });

});

app.get("/about", function (req, res) {

    res.render("about");

});

app.post("/", function (req, res) {

    const toDo = req.body.todo;
    const listName = req.body.list;

    const item = new Item({
        name: toDo
    });
    // console.log(currentDay.substring(0 , currentDay.indexOf(",")));
    // console.log(listName);
    if (listName === currentDay) {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }


});

app.post("/delete", function (req, res) {
    let checkedId = req.body.checkbox;
    let listName = req.body.listName;
    console.log(listName);
    if (listName === currentDay){
        Item.findByIdAndRemove(checkedId, function (err) {
            if (!err) {
                res.redirect("/" + listName);
                console.log("Deleting..." + checkedId);
            } else {
                console.log("Not deleting")
            }
        });
    } else {
        List.findOneAndUpdate(
            {name: listName},
            {$pull: {items: {_id:checkedId}}},
            function (err, foundList) {
            if(!err){
                res.redirect("/" + listName);
            }
            
        });
    }
    
});

let port = process.env.PORT;

if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
    console.log("Network Up and Running on port 3000");

});
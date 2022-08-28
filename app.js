const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const date = require(__dirname + "/date.js")

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true });

const itemsSchema = {
    name: String
}

const Item = new mongoose.model("Item", itemsSchema);

const shopping = new Item({
    name: "Shopping"
});
const exercise = new Item({
    name: "Exercise"
});
const eat = new Item({
    name: "Eat"
});

const defaultItems = [shopping, exercise, eat];

app.get("/", function (req, res) {
    const currentDay = date.getDate();
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

app.get("/about", function (req, res) {

    res.render("about");

});

app.post("/", function (req, res) {

    const toDo = req.body.todo;
    const item = new Item({
        name: toDo
    });
    item.save();
    res.redirect("/");

});

app.post("/delete", function (req, res) {
    let checkedId = req.body.checkbox;
    let collection;
    console.log(req.body.checkbox);
    Item.findByIdAndRemove(checkedId, function (err) {
        if (!err) {
            res.redirect("/")
            console.log("Deleting...");
        }
    });
});

app.listen("3000", function () {

    console.log("Network Up and Running on port 3000");

});
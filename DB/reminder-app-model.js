const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reminderSchema = new Schema({
    title: String,
    text: String,
    date: {
        type: String,
        required: true
    },
    id: String,
    checked: Boolean,
    deleted: Boolean
}, { timestamps: true });

// singular of collection name and schema obj
const Reminder = mongoose.model('reminders', reminderSchema);
module.exports = Reminder;
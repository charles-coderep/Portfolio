const express = require('express');
const router = express.Router();
const Reminder = require("../DB/reminder-app-model.js");

router.use(express.json({
    limit: '700kb',
    type: 'application/json',
}));

router.post('/reminderAppData', (req, res) => {
    const reminder = new Reminder(req.body);
    reminder.save()
        .then((result) => {
            console.log('saved'); //send as json
        })
        .catch((err) => {
            console.log(err);
            //console.log(req.body);
            res.end(); //no reponse given
        });
});

router.put('/reminderAppData', (req, res) => {
    let id = req.body.id;
    Reminder.updateOne({ id: id }, { $set: req.body })
        .then((result) => {
            console.log('updated');
        })
        .catch((err) => {
            console.log(err);
        })
    res.end(); //no reponse given
});

router.delete('/reminderAppData', (req, res) => {
    let id = req.body.id;
    Reminder.deleteOne({ id: id }, { $set: req.body })
        .then((result) => {
            console.log('deleted');
        })
        .catch((err) => {
            console.log(err);
        })
    res.end(); //no reponse given
});

//get request route, load db data
router.get('/reminderAppData', (req, res) => {
    Reminder.find()//.sort({ createdAt: -1 }) //send latest entry first
        .then((result) => {
            res.json(result); // send as json
        })
        .catch((err) => {
            console.log(err);
        })
});

module.exports = router;
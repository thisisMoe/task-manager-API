const express = require('express');
const Task = require('../models/task');
const auth = require('../middlewares/auth');
const router = new express.Router();

//Task creation endpoint
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body, //(...) ES6 spread operator
        owner: req.user._id, //Add owner property onto created task object (description, completed, owner)
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    }

    // task.save()
    //     .then(() => {
    //         res.status(201).send(task);
    //     })
    //     .catch((e) => {
    //         res.status(400).send(e);
    //     });
});

//(R) Fetching all tasks (ressources reading endpoint)
// GET /tasks?completed=true
// GET /task?limit=10&skip=20 ==> (third page of 10's)
// GET /task?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};

    //filtering data by completed (true/false and none for fetching all tasks)
    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        //using bracket notation to grab the first item in the parts array (createdAt) and using it
        //as the name of the property we're setting on sort <sort[parts[0]]>
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
        ////////////////[    Condition   ] ? [-1 if true] : [1 if false]  /////////////////
    }

    try {
        //const tasks = await Task.find({ owner: req.user._id });
        //using populate():
        await req.user
            .populate({
                path: 'tasks', //tasks property on user model expected for path
                match,
                options: {
                    limit: parseInt(req.query.limit),
                    skip: parseInt(req.query.skip),
                    // sort: {
                    //     completed: 1,
                    // },
                    sort,
                },
            })
            .execPopulate();
        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send();
    }
    // Task.find({})
    //     .then((tasks) => {
    //         res.send(tasks);
    //     })
    //     .catch((e) => {
    //         res.status(500).send();
    //     });
});

//Fetching a task by it's id
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOne({ _id, owner: req.user._id });
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
    // Task.findById(_id)
    //     .then((task) => {
    //         if (!task) {
    //             return res.status(404).send();
    //         }
    //         res.send(task);
    //     })
    //     .catch((e) => {
    //         res.status(500).send();
    //     });
});

// Updating task
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    /**Check for every update key ( ie: 'age') return true if included in allowedUpdates  */
    const isValidOp = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOp) {
        return res.status(400).send('error: Invalid updates');
    }

    try {
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        //     new: true /* return the new updated task */,
        //     runValidators: true /*run the validators used in model creation*/,
        // });

        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            res.status(404).send();
        }

        updates.forEach((update) => (task[update] = req.body[update]));
        task.save();
        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

//Delete Task
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;

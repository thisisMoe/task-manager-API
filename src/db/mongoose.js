const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});

//Create a model for Tasks
// const Task = mongoose.model('Task', {
//     descripton: {
//         type: String,
//         required: true,
//         trim: true,
//     },
//     completed: {
//         type: Boolean,
//         default: false,
//     },
// });

//Create a new task (instance)
// const task = new Task({
//     descripton: '    Code for 30 minutes',
// });

// task.save()
//     .then(() => {
//         console.log(task);
//     })
//     .catch((e) => {
//         console.log(e);
//     });

//Creating a new instance of the user model
// const me = new User({
// 	name: 'Jack',
// 	email: 'thisisMoe@node.com    ',
// 	password: 'pass'
// });

// //Saving the created instance to the databasae we created
// me.save()
// 	.then(() => {
// 		console.log(me);
// 	})
// 	.catch(({
// 		errors
// 	}) => {
// 		console.log(errors);
// 	});

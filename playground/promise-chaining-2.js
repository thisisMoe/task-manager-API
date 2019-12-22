require('../src/db/mongoose');
const Task = require('../src/models/task');

// Task.findByIdAndDelete('5dee6efb86268a1024d687fc')
//     .then(() => {
//         return Task.countDocuments({ completed: false });
//     })
//     .then((result) => {
//         console.log(result);
//     })
//     .catch((e) => {
//         console.log(404);
//     });

const deleteTaskAndCount = async (id) => {
    const task = await Task.findByIdAndDelete(id);
    const count = await Task.countDocuments({ completed: false });
    return count;
};

deleteTaskAndCount('5df0fe9a98c06b2c607eacf4')
    .then((count) => {
        console.log(count);
    })
    .catch((e) => {
        console.log(e);
    });

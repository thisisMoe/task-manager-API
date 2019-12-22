require('../src/db/mongoose');
const User = require('../src/models/user');

//Promise chaining example
// User.findByIdAndUpdate('5ded171b34f1671ec895848b', { age: 1 })
//     .then((user) => {
//         console.log(user);
//         return User.countDocuments({ age: 1 });
//     })
//     .then((result) => {
//         console.log(result);
//     })
//     .catch((e) => {
//         console.log(e);
//     });

const updateAgeAndCount = async (id, age) => {
    const user = await User.findByIdAndUpdate(id, { age } /* {age : age}*/);
    const count = await User.countDocuments({ age });
    return count;
};

updateAgeAndCount('5dee6f2c86268a1024d687fe', 2)
    .then((count) => {
        console.log(count);
    })
    .catch((e) => {
        console.log(e);
    });

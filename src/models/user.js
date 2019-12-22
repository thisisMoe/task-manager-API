const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        age: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0) {
                    throw new Error('Age must be positive');
                }
            },
        },
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Email is invalid');
                }
            },
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 7,
            validate(value) {
                if (value.toLowerCase().includes('password')) {
                    throw new Error('Password cannot contains "password"');
                }
            },
        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true,
                },
            },
        ],
        avatar: {
            type: Buffer
        }
    },
    {
        timestamps: true,
    },
);

/*The instance method below is responsible for generating new authentication tokens. The
token is created, stored in the database, and finally returned from the function.*/
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    //add generated token to user's tokens array of objects
    user.tokens = user.tokens.concat({ token: token });
    //saving the new user to the DB
    await user.save();

    return token;
};

/////////////////////////////
/*The code below adds a tasks field onto users that can be used to fetch the tasks for a given user. It’s a virtual property
because users in the database won’t have a tasks field. It’s a reference to the task data stored in the separate collection. */
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner',
});

//Hiding private data (delete user.password and user.tokens) before sending the user
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
};

//User login: creating findByCredentials method for userSchema ( User.findByCredentials(email, password) )
//Finds a user by it's email and password
//Call findByCredentials from the app when users need to login
//Routers: (router.post('/users/login', async (req, res)=>{const user = await User.findByCredentials(req.body.email, req.body.password)}))
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new Error('Unable to login');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Unable to login');
    }

    return user;
};

//(Mongoose middleware) hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

//(Mongoose middleware) Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({ owner: user._id });
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;

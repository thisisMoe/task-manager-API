const express = require('express');
const User = require('../models/user');
const sharp = require('sharp');
const auth = require('../middlewares/auth');
const router = new express.Router();
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account');
const multer = require('multer');

//User creation endpoint
router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        //Send Welcome Email
        sendWelcomeEmail(user.email, user.name);
        //generating and saving the token after the user is saved
        const token = await user.generateAuthToken();

        res.status(201).send({ user, token });
    } catch (e) {
        //Set status code to 400 and send error
        res.status(400).send(e);
    }
});

//User login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send();
    }
});

//User logout post route
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();

        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

//User logout from all devices
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

//Reading profile endpoint (fetching user profile if authenticated)
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

//Update user
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOp = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOp) {
        return res.status(400).send('error: invalid updates');
    }

    try {
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        ////OR
        // const user = await User.findById(req.params.id);
        // updates.forEach((update) => (user[update] = req.body[update]));

        // await user.save();

        // if (!user) {
        //     res.status(404).send();
        // }
        ////Even better:
        updates.forEach((update) => (req.user[update] = req.body[update]));

        await req.user.save();

        res.send(req.user);
    } catch (e) {
        res.status(400).send();
    }
});

//Delete user
router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.params.id);

        // if (!user) {
        //     res.status(404).send();
        // }
        await req.user.remove();
        sendCancellationEmail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
});

// Setup endpoint for avatar endpoint
// Post /users/me/avatar

const upload = multer({
    //removed dest to prevent multer from saving a file onto filesystem and allow it to pass the data to handler
    //dest: 'avatar',
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('File must be an image'));
        }

        cb(undefined, true);
    },
});
router.post(
    '/users/me/avatar',
    auth,
    upload.single('avatar'),
    async (req, res) => {
        //Used sharp module to resize the image and convert it to .png
        const buffer = await sharp(req.file.buffer)
            .resize({ width: 250, height: 250 })
            .png()
            .toBuffer();
        req.user.avatar = buffer;
        await req.user.save();
        res.send();
    },
    //Handle any uncought errors(handling express errors)
    (error, req, res, next) => {
        res.status(400).send({ error: error.message });
    },
);

//Setup endpoint for deleting avatar
// DELETE /users/me/avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

//Serve up avatar image
//GET /users/:id/avatar
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            throw new Error();
        }
        //Setting response header ('key', 'value')
        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (e) {
        res.status(404).send();
    }
});

module.exports = router;

//Reading a single user by id
// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id;

//     try {
//         const user = await User.findById(_id);

//         if (!user) {
//             return res.status(404).send();
//         }

//         res.send(user);
//     } catch (e) {
//         res.status(500).send();
//     }

//     // User.findById(_id)
//     //     .then((user) => {
//     //         if (!user) {
//     //             return res.status(404).send();
//     //         }
//     //         res.send(user);
//     //     })
//     //     .catch((e) => {
//     //         res.status(500).send();
//     //     });
// });

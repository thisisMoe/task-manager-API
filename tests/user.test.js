const request = require('supertest');
const app = require('../src/app');
const { userOne, userOneId, setupDatabase } = require('./fixtures/db');
const User = require('../src/models/user');

beforeEach(setupDatabase);

test('Should sign up a new user', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Mike',
            email: 'mike@example.com',
            password: 'Red12345!',
        })
        .expect(201);

    //Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    //Assertion about the response body
    expect(response.body).toMatchObject({
        user: {
            name: 'Mike',
            email: 'mike@example.com',
        },
        token: user.tokens[0].token,
    });
    expect(user.password).not.toBe('Red12345!');
});

test('Should login existing user', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password,
        })
        .expect(200);
    //Validate new token is saved
    const user = await User.findById(userOneId);
    expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not login nonexisting user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'm@gmail.com',
            password: '45what!!',
        })
        .expect(400);
});

test('Should get profile for auth user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
});

test('Shoul not get unauthrized user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401);
});

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
    //Validate user is deleted
    const user = await User.findById(userOneId);
    expect(user).toBeNull();
});

test('Should not delete account for unauthorized user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401);
});

test('Should upload user avatar', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200);
    //Check for valid buffer data
    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Bounoua',
        })
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user.name).toEqual('Bounoua');
});

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Adrar',
        })
        .expect(400);
});

// Should not signup user with invalid password
test('Should not signup user with invalid password', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'mike',
            email: 'google@google.com',
            password: '123',
        })
        .expect(400);
});

// Should not signup user with invalid email
test('Should not signup user with invalid email', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'mike',
            email: 'google@g',
            password: '123',
        })
        .expect(400);
});

// Should not signup user with invalid name
test('Should not signup user with invalid name', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: '',
            email: 'google@google.com',
            password: '1234ssss',
        })
        .expect(400);
});

import { Router, Request, Response } from 'express';
import * as EmailValidator from 'email-validator';
import {knexInstance} from '../../../../knex';
import { comparePasswords, generatePassword } from '../../../../utils/auth'
import { generateJWT} from '../../../../utils/jwt'

const uuid = require('uuid')

const router: Router = Router();


//register a new user {{host}}/api/v0/auth/
router.post('/', async (req: Request, res: Response) => {
    const id = uuid.v4()
    const email = req.body.email;
    const plainTextPassword = req.body.password;
    const name = req.body.name;
    
    // check email is valid
    if (!email || !EmailValidator.validate(email)) {
        return res.status(400).send({ auth: false, message: 'Email is required or malformed' });
    }

    // check email password valid
    if (!plainTextPassword) {
        return res.status(400).send({ auth: false, message: 'Password is required' });
    }

    // find the user
    const user = await knexInstance('users').where('email', email).select('email', 'name')

    // check that user doesnt exists
    if(user[0]) {
        return res.status(422).send({ 
            auth: false, 
            message: 'User may already exist', 
            creds: user[0]
        });
    }

    // Generate hashed password that will be inputted into db
    const password_hash = await generatePassword(plainTextPassword);
    
    const newUser = {
        id,
        email,
        name,
        wallet_bal: 0
    }

    // Insert values into database
    await knexInstance('users')
        .insert({
            ...newUser,
            password: password_hash
        })

    // Generate JWT
    const jwt = generateJWT(newUser);

    res.status(201).send({
        token: jwt, 
        user: newUser
    });
});

//Login an existing user {{host}}/api/v0/auth/login
router.post('/login', async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;

    // check email is valid
    if (!email || !EmailValidator.validate(email)) {
        return res.status(400).send({ auth: false, message: 'Email is required or malformed' });
    }

    // check email password valid
    if (!password) {
        return res.status(400).send({ auth: false, message: 'Password is required' });
    }

    // check that user exists
    const getUser = await knexInstance('users').where({
        email: email,
      }).select('*')

    const user = getUser[0]
    
    //   If user email does not exist in db user is unauthurized
    if(!user) {
        return res.status(401).send({ auth: false, message: 'Unauthorized' });
    }

    // If user exist check that the password matches
    const authValid = await comparePasswords(password, user.password)

    // If password does not match user is unauthorized
    if(!authValid) {
        return res.status(401).send({ auth: false, message: 'Unauthorized' });
    }

    const userInfo = {
        id: user.id,
        email: user.email,
        name: user.name,
        wallet_bal: user.wallet_bal
    }

    // Generate JWT
    const jwt = generateJWT(userInfo);

    res.status(200).send({ auth: true, token: jwt, user: userInfo});
});


//List all users {{host}}/api/v0/auth/users/
router.get('/users', 
    async (req: Request, res: Response) => {

        const account =  await knexInstance.select(['id', 'name', 'email', 'wallet_bal'])
        .from('users')

        const response = {
            ...account
        }

        res.status(201).send({
            accounts: response
        });
});


router.get('/', async (req: Request, res: Response) => {
    res.send('auth')
});


export const AuthRouter: Router = router;
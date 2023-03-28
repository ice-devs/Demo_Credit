import { Router, Request, Response } from 'express';

import {knexInstance} from '../../../../knex';

import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { NextFunction } from 'connect';

import * as EmailValidator from 'email-validator';
import * as c from '../../../../config/config';

const uuid = require('uuid')

const router: Router = Router();


export async function generatePassword(plainTextPassword: string): Promise<string> {
    //Use Bcrypt to Generated Salted Hashed Passwords
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash  = await bcrypt.hash(plainTextPassword, salt);
    return hash;
}

export async function comparePasswords(plainTextPassword: string, hash: string): Promise<boolean> {
    // Use Bcrypt to Compare your password to your Salted Hashed Password
    const compare = await bcrypt.compare(plainTextPassword, hash);
    return compare;
}

export function generateJWT(user: any): string {
    //Use jwt to create a new JWT Payload containing
    return jwt.sign(JSON.stringify(user), c.config.jwt.secret);
}

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

// export const CreateRouter: Router = router;

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.headers || !req.headers.authorization) {
      return res.status(401).send({message: 'No authorization headers.'});
    }
  
    const tokenBearer = req.headers.authorization.split(' ');
    if (tokenBearer.length != 2) {
      return res.status(401).send({message: 'Malformed token.'});
    }
  
    const token = tokenBearer[1];
    return jwt.verify(token, c.config.jwt.secret, (err, decoded) => {
      if (err) {
        return res.status(500).send({auth: false, message: 'Failed to authenticate.'});
      }
      return next();
    });
}
import { Router, Request, Response } from 'express';
import {knexInstance} from '../../../../knex';
import { requireAuth } from '../../users/routes/auth'
import { decodeJwt } from '../../../../utils/jwt'

const uuid = require('uuid')

const router: Router = Router();

//register a new account {{host}}/api/v0/create/
router.post('/', 
    requireAuth,
    async (req: Request, res: Response) => {
        // Retrieve Jwt from authorization header and decode it
        const tokenBearer = req.headers.authorization.split(' ');
        const Jwtdecoded = decodeJwt(tokenBearer)

        // Using the decoded token variables to create constants
        const user_id = Jwtdecoded.id
        const email = Jwtdecoded.email
        const name = Jwtdecoded.name
        const wallet_bal = Jwtdecoded.wallet_bal

        // Rtrieve the request account name from the body of our request
        const accName = req.body.accountName;

        const status = 'active'
        const id = uuid.v4()

        // check email password valid
        if (!accName) {
            return res.status(400).send({ auth: false, message: 'Account name is required' });
        }

        const newAccount = {
            id,
            account_name: accName,
            user_id,
            status
        }

        // Insert values into database
        await knexInstance('accounts')
            .insert({
                ...newAccount
            })

        // Retrive newly added account details form database
        const account =  await knexInstance('accounts').where('id', id).select('*')

        const response = {
            ...account[0],
            email,
            name,
            wallet_bal
        }

        res.status(201).send({
            account: response
        });
    });

export const CreateRouter: Router = router;
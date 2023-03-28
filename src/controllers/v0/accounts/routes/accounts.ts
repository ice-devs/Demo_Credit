import { Router, Request, Response } from 'express';
import {knexInstance} from '../../../../knex';

const router: Router = Router();

//List all accounts {{host}}/api/v0/accounts/
router.get('/', 
    async (req: Request, res: Response) => {

        // Retrive all account details form database
        const account =  await knexInstance.select('*')
        .from('accounts')

        const response = {
            ...account
        }

        res.status(201).send({
            accounts: response
        });
    });


//List all accounts of a particular user {{host}}/api/v0/accounts/byUserId/?userId={{user id}}
router.get('/byUserId/', 
    async (req: Request, res: Response) => {
        const user_id = req.query.userid

        // Retrive  account details form database using user_id
        const account =  await knexInstance.select('*')
        .from('accounts').where({user_id})

        const response = {
            ...account
        }

        res.status(201).send({
            accounts: response
        });
    });

export const ListAccountsRouter: Router = router;
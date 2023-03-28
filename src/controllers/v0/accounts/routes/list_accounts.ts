import { Router, Request, Response } from 'express';
import {knexInstance} from '../../../../knex';
import { requireAuth } from '../../users/routes/auth'

const router: Router = Router();

//List all accounts {{host}}/api/v0/accounts/
router.get('/', 
    requireAuth,
    async (req: Request, res: Response) => {

        // Retrive newly added account details form database
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
    requireAuth,
    async (req: Request, res: Response) => {
        const user_id = req.query.userid

        // Retrive newly added account details form database
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
import { Router, Request, Response } from 'express';
import { knexInstance } from '../../../../knex';

const router: Router = Router();


//Deposit into user wallet using the user's id {{host}}/api/v0/deposit/
router.post('/', 
    async (req: Request, res: Response) => {

        // Retrieve the request user_id and amount from the body of our request
        const user_id = req.body.userId;
        const amount = req.body.amount; 

        // check user_id and amount are valid
        if (!user_id || typeof user_id !== 'string') {
            return res.status(400).send({ auth: false, message: 'User\'s id is absent or malformed ' });
        }

        if (!amount || typeof amount !== 'number' || amount <= 0 ) {
            return res.status(400).send({ auth: false, message: 'Amount is absent or malformed ' });
        }

        // Check if the user exist
        const getUser =  await knexInstance('users').where('id', user_id).select(['*'])
        if(!getUser[0]){
            return res.status(400).send({ auth: false, message: 'User does not exist, please check user id' });
        }

        // if yes, proceed to update wallet_bal of the user
        await knexInstance('users')
            .where({
                id: user_id
            }).increment(
                'wallet_bal' , amount
            )
    
        // Retrieve updated values from dtabase
        const getUpdatedUser =  await knexInstance('users').where('id', user_id).select(['id', 'name', 'email', 'wallet_bal'])
        const updatedUser = getUpdatedUser[0]

        const response = {
            ...updatedUser
        }

        res.status(201).send({
            account: response
        });
    });


export const DepositRouter: Router = router;
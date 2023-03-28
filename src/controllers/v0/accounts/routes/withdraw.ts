import { Router, Request, Response } from 'express';
import {knexInstance} from '../../../../knex';
import { requireAuth } from '../../../../utils/auth'
import { decodeJwt } from '../../../../utils/jwt'

const router: Router = Router();

//Withdraw from account into wallet of a particular user {{host}}/api/v0/withdraw/
router.post('/', 
    requireAuth,
    async (req: Request, res: Response) => {
        // Retrieve Jwt from authorization header and decode it
        const tokenBearer = req.headers.authorization.split(' ');
        const Jwtdecoded = decodeJwt(tokenBearer)

        // Using the decoded token variables to create constants
        const user_id = Jwtdecoded.id

        // Rtrieve the request account name from the body of our request
        const accNum = req.body.accountNum;
        const amount = req.body.amount; 

        // check account number and amount are valid
        if (!accNum || typeof accNum !== 'number') {
            return res.status(400).send({ auth: false, message: 'Account number is absent or malformed ' });
        }

        if (!amount || typeof amount !== 'number' || amount <= 0 ) {
            return res.status(400).send({ auth: false, message: 'Amount is absent or malformed ' });
        }

        // Check if the account exist
        const getAccount =  await knexInstance('accounts').where('account_num', accNum).select('*')
        if(!getAccount[0]){
            return res.status(400).send({ auth: false, message: 'Account does not exist, please check account number' });
        }

        // if the account exists
        // Checks if the account belongs to the current user
        const accUserId = getAccount[0].user_id
        if (user_id !== accUserId){
            return res.status(400).send({ auth: false, message: 'You can\'t withdraw from this account, because it does not belong to the current user ' });
        }

        // make sure tha the ammount about to be withdrawn from it is not more than it's actual balance
        const accBalance = getAccount[0].account_bal
        if ( accBalance < amount ){
            return res.status(400).send({ auth: false, message: 'You don\'t have sufficient balance in your account to perform this operation' });
        }

        // Proceed to deduct amount from the account
        await knexInstance('accounts')
            .where({
                account_num : accNum,
                user_id
            }).decrement(
                'account_bal' , amount
            ).update({
                updated_at: knexInstance.fn.now()
            }
        )

        // Then update wallet balance adding the new amount
        await knexInstance('users')
            .where({
                id: user_id
            }).increment(
                'wallet_bal' , amount
            )

        // Retrive newly added account details form database
        const getUpdatedAcc =  await knexInstance('accounts').where('account_num', accNum).select('*')
        const getUpdatedUser =  await knexInstance('users').where('id', user_id).select(['wallet_bal', 'name'])
        const updatedAcc = getUpdatedAcc[0]
        const updatedUser = getUpdatedUser[0]

        const response = {
            account_id: updatedAcc.id,
            amount_withdrawn: amount,
            account_bal: updatedAcc.account_bal,
            account_num: updatedAcc.account_num,
            account_name: updatedAcc.account_name,
            account_status: updatedAcc.status,
            user_id: updatedAcc.user_id,
            wallet_balance: updatedUser.wallet_bal,
            user_name: updatedUser.name,
            updatad_at: updatedAcc.updated_at
        }

        res.status(201).send({
            account: response
        });
    });

export const WithdrawRouter: Router = router;
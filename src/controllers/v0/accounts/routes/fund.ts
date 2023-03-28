import { Router, Request, Response } from 'express';
import {knexInstance} from '../../../../knex';
import { requireAuth } from '../../users/routes/auth'
import { decodeJwt } from '../../../../utils/jwt'

const router: Router = Router();

//Fund account from the wallet balance of a particular user {{host}}/api/v0/fund/
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

        // Retrieve user details from database
        const getUser =  await knexInstance('users').where('id', user_id).select(['*'])
        const wallet_bal = getUser[0].wallet_bal

        // Makes sure wallet balance is not < the ammount the account is to be funded with
        if ( wallet_bal < amount ){
            return res.status(400).send({ auth: false, message: 'You don\'t have sufficient wallet balance perform this operation' });
        }

        // Query databasse using account_num
        const getAccount =  await knexInstance('accounts').where('account_num', accNum).select('*')

        // Check if the account exist
        if(!getAccount[0]){
            return res.status(400).send({ auth: false, message: 'Account does not exist, please check account number' });
        }

        const accUserId = getAccount[0].user_id

        // Checks if the account belongs to the current user
        if (user_id !== accUserId){
            return res.status(400).send({ auth: false, message: 'You can\'t fund this account, because it does not belong to the current user ' });
        }

        // Proceed to update account balance and updated_at fields
        await knexInstance('accounts')
            .where({
                account_num : accNum,
                user_id
            }).increment(
                'account_bal' , amount
            ).update({
                updated_at: knexInstance.fn.now()
            }
        )

        
        // Then Update wallet balance
        await knexInstance('users')
            .where({
                id: user_id
            }).decrement(
                'wallet_bal' , amount
            )

        // Retrive newly added account details form database
        const getUpdatedAcc =  await knexInstance('accounts').where('account_num', accNum).select('*')
        const getUpdatedUser =  await knexInstance('users').where('id', user_id).select(['wallet_bal', 'name'])
        const updatedAcc = getUpdatedAcc[0]
        const updatedUser = getUpdatedUser[0]

        const response = {
            account_id: updatedAcc.id,
            amount_funded: amount,
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

export const FundRouter: Router = router;
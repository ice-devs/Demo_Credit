import { Router, Request, Response } from 'express';
import {knexInstance} from '../../../../knex';
import { requireAuth } from '../../users/routes/auth'
import { decodeJwt } from '../../../../utils/jwt'

const router: Router = Router();


//Transfer funds to another account {{host}}/api/v0/transfer/
router.post('/', 
    requireAuth,
    async (req: Request, res: Response) => {
        // Retrieve Jwt from authorization header and decode it
        const tokenBearer = req.headers.authorization.split(' ');
        const Jwtdecoded = decodeJwt(tokenBearer)

        // Using the decoded token variables to create constants
        const user_id = Jwtdecoded.id

        // Rtrieve the request account name from the body of our request
        const sender_acc = req.body.fromAccount;
        const receiver_acc = req.body.toAccount; 
        const amount = req.body.amount; 

        // check account number and amount are valid
        if (!sender_acc || typeof sender_acc !== 'number') {
            return res.status(400).send({ auth: false, message: 'Sender account number is absent or malformed ' });
        }

        if (!receiver_acc || typeof receiver_acc !== 'number') {
            return res.status(400).send({ auth: false, message: 'Receiver account number is absent or malformed ' });
        }

        if (!amount || typeof amount !== 'number' || amount <= 0 ) {
            return res.status(400).send({ auth: false, message: 'Amount is absent or malformed ' });
        }

        // Check if the sender and reciever account balance exist in database
        const senderAccount =  await knexInstance('accounts').where('account_num', sender_acc).select('*')
        if(!senderAccount[0]){
            return res.status(400).send({ auth: false, message: 'Invalid sender\'s account number, please check account number' });
        }

        const receiverAccount =  await knexInstance('accounts').where('account_num', receiver_acc).select('*')
        if(!receiverAccount[0]){
            return res.status(400).send({ auth: false, message: 'Invalid receiver account number, please check account number' });
        }

        // Checks if the sender accoubt belongs to the current user
        const senderUserId = senderAccount[0].user_id
        if (user_id !== senderUserId){
            return res.status(400).send({ auth: false, message: 'You can\'t transfer from this account, because it does not belong to the current user ' });
        }

        // Checks if the sender's account balance is not less than the amountto be sent
        const senderBalance = senderAccount[0].account_bal
        if(senderBalance < amount){
            return res.status(400).send({ auth: false, message: 'You don\'t have sufficient amount in this account to perform this operation' });
        }
        
        // Proceed to update receiver's account balance and updated_at fields
        await knexInstance('accounts')
            .where({
                account_num : receiver_acc,
            }).increment(
                'account_bal' , amount
            ).update({
                updated_at: knexInstance.fn.now()
            }
        )

        // Then Update sender's account balance and updated_at fields also
        await knexInstance('accounts')
            .where({
                account_num : sender_acc,
                user_id
            }).decrement(
                'account_bal' , amount
            ).update({
                updated_at: knexInstance.fn.now()
            })

        // Retrive newly added sender account details form database
        const updated =  await knexInstance('accounts').where('account_num', sender_acc).select('*')
        const updatedAcc = updated[0]
        
        const receiverName = receiverAccount[0].account_name

        // return body
        const response = {
            account_id: updatedAcc.id,
            amount_transfered: amount,
            balance: updatedAcc.account_bal,
            from: updatedAcc.account_num,
            from_acc_name: updatedAcc.account_name,
            to: receiver_acc,
            to_acc_name: receiverName,
            update_at: updatedAcc.updated_at
        }

        res.status(201).send({
            account: response
        });
    });

export const TransferRouter: Router = router;
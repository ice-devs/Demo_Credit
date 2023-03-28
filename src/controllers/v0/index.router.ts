import {Router, Request, Response} from 'express';
import {AuthRouter} from './users/routes/auth';
import {CreateRouter} from './accounts/routes/create';
import {FundRouter} from './accounts/routes/fund';
import {TransferRouter} from './accounts/routes/transfer';
import {WithdrawRouter} from './accounts/routes/withdraw';
import {ListAccountsRouter} from './accounts/routes/list_accounts';

const router: Router = Router();

router.use('/auth/', AuthRouter);
router.use('/create/', CreateRouter);
router.use('/fund/', FundRouter);
router.use('/transfer/', TransferRouter);
router.use('/withdraw/', WithdrawRouter);
router.use('/accounts/', ListAccountsRouter);

router.get('/', async (req: Request, res: Response) => {
  res.send(`V0`);
});

export const IndexRouter: Router = router;

import { Knex, knex } from 'knex'

import {config} from './config/config';



// const configs: Knex.Config = {
//     client: config.dev.database,
//     connection: {
//         host : 'adminice.cqdgmiiqkcft.us-east-1.rds.amazonaws.com',
//         port : 3306,
//         user : 'adminice',
//         password : 'adminice',
//         database : 'adminice'
//     },
// };

const configs: Knex.Config = {
    client: config.dev.database,
    connection: {
        host : config.dev.host,
        port : config.dev.port,
        user : config.dev.username,
        password : config.dev.password,
        database : config.dev.dbname
    },
};

export const knexInstance = knex(configs);

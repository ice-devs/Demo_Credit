import { Knex, knex } from 'knex'

import {config} from './config/config';

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

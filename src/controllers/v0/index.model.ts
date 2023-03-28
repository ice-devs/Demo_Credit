import {knexInstance} from '../../knex';

export const createTables = async function(): Promise<string> {
    if (await knexInstance.schema.hasTable('users')===false){
        const users = await knexInstance.schema
        .createTable('users', table => {
        table.string('id').primary();
        table.string('name').notNullable();
        table.string('email').unique().notNullable();
        table.string('password').notNullable();
        table.float('wallet_bal').unsigned().notNullable().defaultTo(0);
        })
    }

    if (await knexInstance.schema.hasTable('accounts')===false){
        const accounts = await knexInstance.schema
        .createTable('accounts', table => {
        table.string('id').notNullable().unique();
        table.increments('account_num').notNullable();
        table.string('account_name').notNullable();
        table.string('user_id').notNullable();
        table.float('account_bal').notNullable().defaultTo(0.00);
        table.string('status').notNullable();
        table.timestamp('created_at').defaultTo(knexInstance.fn.now());
        table.timestamp('updated_at').defaultTo(knexInstance.fn.now());
        }).raw('ALTER TABLE accounts AUTO_INCREMENT = 100000');
    }
    
    return 'Table \'users\' and \'accounts\' updated/created successfully!'
}


export const dropTable = async function(): Promise<string> {
    await knexInstance.schema.dropTableIfExists('accounts');
    await knexInstance.schema.dropTableIfExists('users');
    
    return 'Table \'users\' and \'accounts\' dropped successfully!'
}
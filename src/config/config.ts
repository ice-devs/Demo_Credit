export const config = {
    "dev": {
      "database": process.env.MYSQL_DATABASE,
      "host": process.env.MYSQL_HOST,
      "dbname": process.env.MYSQL_DBNAME,
      "port": Number(process.env.MYSQL_PORT),
      "username": process.env.MYSQL_USERNAME,
      "password": process.env.MYSQL_PASSWORD,
      "url": process.env.URL
    },
    "jwt": {
      "secret": process.env.JWT_SECRET
    }
  }
  
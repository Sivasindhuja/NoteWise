import pg from "pg"
import dotenv from 'dotenv'
dotenv.config();

const pool=new pg.Pool({
    user:process.env.DB_USER,
    host:process.env.DB_HOST,
    database:process.env.DB_DATABASE,
    password:process.env.DB_PASSWORD,
    port:process.env.DB_PORT,
}
)
//function
async function query(text,params){
    return await pool.query(text,params);
}
async function connectDB(){
    try{
        await pool.connect();
        console.log('postgres connected successfully using a connection pool');
    }

    catch(err){
        console.log('an error ocuured',err.message);  
    }
}
export {query,connectDB};
export default pool;
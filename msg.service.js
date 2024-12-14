
const MongoClient = require('mongodb').MongoClient
// import clientPromise from "./mongodb";
// import axios from "axios";

// const msgService = {
//     sendMsg
// };

async function sendMsg() {
    const url = 'https://api.telegram.org/bot6587081386:AAEFpKmoTbj52EpWirs8WTN33I4VCqC6fdw/sendMessage?chat_id=644190724&text=';
    const collectionName = 'tasks'
    const collection = await getCollection(collectionName)
    const data = await collection.find().toArray()
    const time = Date.now()
    const filteredData = data.filter(val => val.dueDate && Date.parse(val.dueDate) - time < (3 * 24 * 60 * 60 * 1000))
    const messages = filteredData.map(val => {
        const itemDate = Date.parse(val.dueDate);
        const timeDifference = itemDate - time;
        let date;
        console.log(val.dueDate, timeDifference)
        if (timeDifference > 0) {
            if (timeDifference < 24 * 60 * 60 * 1000) {
                date = 'Завтра';
            } else {
                const days = Math.floor(timeDifference / (24 * 60 * 60 * 1000));
                date = `через ${days} ${days < 5 ? 'дня' : 'дней'}`;
            }
        }
        else {
            if (Math.floor(timeDifference) < 24 * 60 * 60 * 1000) {
                date = 'Сегодня';
            }
            else if (Math.floor(timeDifference) < 2 * 24 * 60 * 60 * 1000) {
                date = 'нужно было оплатить вчера';
            } else {
                const days = Math.abs(Math.floor(timeDifference / (24 * 60 * 60 * 1000)));
                date = `нужно было оплатить ${days} ${days < 5 ? 'дня' : 'дней'} назад`;
            }

        }

        return `${val.text}  ${date || ''}`;
    });

    async function postData(url) {
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    await fetch(url + 'Гуд Морнинг', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    await fetch(url + 'Вот задачи на ближайшие 3 дня', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    //  axios.post(url + 'Гуд Морнинг')
    //  axios.post(url + 'Вот что нужно оплатить на ближайшие 7 дней')

    for (let i = 0; i < messages.length; i++) {
        await postData(url + messages[i])
            .then(data => console.log('OK'))
            .catch(error => console.error('Error:', error));
    }


    return 'done'

}


const dbURL = process.env.MONGODB_URI; // Убедитесь, что MONGODB_URI находится в .env.local
const dbName = "TodoDB"



var dbConn = null

async function getCollection(collectionName) {
    try {
        const db = await connect()
        const collection = await db.collection(collectionName)
        return collection
    } catch (err) {
        console.log('Failed to get Mongo collection', err)
        throw err
    }
}

async function connect() {
    if (dbConn) return dbConn
    try {
        const client = await MongoClient.connect(dbURL)
        const db = client.db(dbName)
        dbConn = db
        return db
    } catch (err) {
        console.log('Cannot Connect to DB', err)
        throw err
    }
}

// export default msgService
module.exports = {
    sendMsg
}

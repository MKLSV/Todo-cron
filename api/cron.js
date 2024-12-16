
import { getDataFromMongoDB, sendToTelegram } from '../service.js';

export default async function handler(req, res) {
  try {
    const response = await getDataFromMongoDB()
    const time = Date.now()
    const filteredData = response.filter(val => !val.isCompleted && val.dueDate && val.dueDate - time < (3 * 24 * 60 * 60 * 1000))
    const DataForAll = filteredData.filter(val => val.owner === 'Для всех')
    const DataForMT = filteredData.filter(val => val.owner === 'Матвей')
    const DataForDea = filteredData.filter(val => val.owner === 'Делайла')

    const MTtasks = [...DataForAll, ...DataForMT]
    const DEAtasks = [...DataForAll, ...DataForDea]

    if (MTtasks.length) sendMsg(MTtasks, "MT")
    if (DEAtasks.length) sendMsg(DEAtasks, "DEA")

    res.status(200).json({ message: 'Сообщение отправлено' });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

async function sendMsg(tasks, user) {
  const sortedTasks = sortTasks(tasks)
  const taskMessage ='Привет, вот задачи которые нужно выполнить в ближайшие дни:\n\n'
  // sendToTelegram('Привет, вот задачи которые нужно выполнить в ближайшие дни:', user)
  if (sortedTasks.overdue.length) {
    const msg = '🕒Просрочено:\n' + sortedTasks.overdue.map(task => {
      return '📌' + task.text + '\n'
    }).join('')
    // await sendToTelegram(msg, user)
    taskMessage += msg
  }
  if (sortedTasks.today.length) {
    const msg = '🕒Сегодня:\n' + sortedTasks.today.map(task => {
      return '📌' + task.text + '\n'
    }).join('')
    // await sendToTelegram(msg, user)
    taskMessage += msg
  }
  if (sortedTasks.tommorow.length) {
    const msg = '🕒До Завтра:\n' + sortedTasks.tommorow.map(task => {
      return '📌' + task.text + '\n'
    }).join('')
    await sendToTelegram(msg, user)
  }
  if (sortedTasks.afterTomorrow.length) {
    const msg = '🕒До Послезавтра:\n' + sortedTasks.afterTomorrow.map(task => {
      return '📌' + task.text + '\n'
    }).join('')
    // await sendToTelegram(msg, user)
    taskMessage += msg
  }
  
  sendToTelegram(taskMessage, user)
}


function sortTasks(tasks) {
  const today = new Date(); // Текущая дата
  const todayDate = today.getDate()
  const todayMonth = today.getDate()
  let sortedTasks = {
    overdue: [],
    today: [],
    tommorow: [],
    afterTomorrow: [],
  }
  tasks.forEach(task => {
    const taskDate = new Date(task.dueDate); // Преобразуем в объект Date
    if (taskDate.getDate() == todayDate) sortedTasks.today.push(task)
    else if (taskDate.getDate() - todayDate === 1 || (taskDate.getMonth() > todayMonth) && taskDate.getDate() === 1) sortedTasks.tommorow.push(task)
    else if (taskDate.getDate() - todayDate === 2 || (taskDate.getMonth() > todayMonth) && taskDate.getDate() === 2) sortedTasks.afterTomorrow.push(task)
    else if (taskDate < today) sortedTasks.overdue.push(task)
  })

  return sortedTasks
}






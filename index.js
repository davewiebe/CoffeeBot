const fs = require('fs')
const moment = require('moment')

const Discord = require('discord.js')
const client = new Discord.Client()
client.commands = new Discord.Collection()

const apiKeys = require('./token')
const { prefix, coffeeTime } = require('./config')
const { getTimeUntilTarget, getRandomGif, getCustomEmbed, timeInOneDay, daysOfTheWeek } = require('./helpers')

function sendCoffeeAlert(channelName) {
    let dayOfTheWeek = daysOfTheWeek[moment().day()]

    if (dayOfTheWeek == 'Saturday' || dayOfTheWeek == 'Sunday') return
    let embed = getCustomEmbed(dayOfTheWeek)

    let channel = client.channels.cache.find(u => u.name === channelName)
    if (!channel) channel = client.channels.cache.find(u => u.type === 'text')
    
    getRandomGif('coffee time').then(gifUrl => {
        embed.setThumbnail(gifUrl)
        channel.send('@here', embed)
    })
}

client.once('ready', () => {
    console.log('CoffeeBot ready...')

    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`)
        client.commands.set(command.name, command)
    }
    
    const timeout = getTimeUntilTarget(coffeeTime.hour, coffeeTime.minute, coffeeTime.second + 10)

    setTimeout(() => {
        const channel = 'appdev'
        sendCoffeeAlert(channel)
        setInterval(sendCoffeeAlert, timeInOneDay, channel)
    }, timeout)
})


client.on('message', message => {
    if (!message.content.startsWith(prefix)) return

    const args = message.content.slice(prefix.length).split(' ')
    const command = args.shift().toLowerCase()

    if (!client.commands.has(command)) return
    
    client.commands.get(command).execute(message, args)
})

client.login(apiKeys.discord)

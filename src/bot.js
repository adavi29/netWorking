require('dotenv').config();
const conversationStarters = require('../helpers/conversationStarters')
const riddles = require('../helpers/riddles');
const { Client, Intents } = require('discord.js');
const riddleAnswers = require('../helpers/riddleAnswers');
let intents = new Intents(Intents.NON_PRIVILEGED);
intents.add('GUILD_MEMBERS');
const client = new Client({
    partials: ['MESSAGE', 'REACTION'],
    intents: intents
});

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

async function createChannels(message, numberPerChannel){
    let guild = message.channel.guild

    if (numberPerChannel) {
        if (guild.available) {
            let members = await message.channel.guild.members.fetch()
    
            members = members.filter(member => !member.user.bot)

            const modulus = members.size % numberPerChannel;
            console.log(modulus)
            let i = 0
            let j = 1
            let newMembers = []

            if (modulus !== 0) {
                if (modulus >= 3) {
                    newMembers = members.random(modulus);
                    await createChannel(guild, newMembers, j);
                    members = members.filter(m => !newMembers.includes(m));
                    j++;
                    i = modulus;
                } else if (modulus == 2) {
                    for(let l = 0; l < 2; l++) {
                        newMembers = members.random(numberPerChannel + 1);
                        await createChannel(guild, newMembers, j);
                        members = members.filter(m => !newMembers.includes(m));
                        j++;
                    }
                    i = (2 * numberPerChannel) + 2;
                } else {
                    newMembers = members.random(numberPerChannel + 1);
                    await createChannel(guild, newMembers, j);
                    members = members.filter(m => !newMembers.includes(m));
                    j++
                    i = numberPerChannel + 1;
                }
            }

            while (i < guild.memberCount-1) {
                newMembers = members.random(numberPerChannel)
                await createChannel(guild, newMembers, j)
                members = members.filter(member => !newMembers.includes(member))
                i += numberPerChannel
                j += 1
            }
        }
    } else {
        if (guild.available) {
            let members = await message.channel.guild.members.fetch()
    
            members = members.filter(member => !member.user.bot)
    
            let i = 0
            let j = 1
            let newMembers = []
    
            switch((members.size) % 4)
            {
                case 1:
                    for(let l = 0; l < 3; l++)
                    {
                        newMembers = members.random(3);
                        await createChannel(guild, newMembers, j);
                        members = members.filter(member => !newMembers.includes(member));
                        j++;
                    }
                    i = 9;
                    break;
                case 2:
                    for(let l = 0; l < 2; l++)
                    {
                        newMembers = members.random(3);
                        await createChannel(guild, newMembers, j);
                        members = members.filter(member => !newMembers.includes(member));
                        j++;
                    }
                    i = 6;
                    break;
                case 3:
                    newMembers = members.random(3);
                    await createChannel(guild, newMembers, j);
                    members = members.filter(member => !newMembers.includes(member));
                    i = 3;
                    j = 2;
                    break;
            }
            while (i < guild.memberCount-1) {
                newMembers = members.random(4)
                await createChannel(guild, newMembers, j)
                members = members.filter(member => !newMembers.includes(member))
                i += 4
                j += 1
            }
        }
    }
}

async function createChannel(guild, newMembers, j)
{
    await guild.channels.create("networking "+ j, { type: "text", 
                                                    parent: "855232209916002315", 
                                                    permissionOverwrites: [
                                                        {
                                                        id: guild.id,
                                                        deny: ['VIEW_CHANNEL'],
                                                    },
                                                    ],})
        .then(channel => {
            addTextMembers(newMembers, channel) 
            channel.send(`Welcome to netWorking!\n\nWe are here to make the daunting task of networking more enjoyable! \n\nTo get you all started here is an ice breaker question: \n**${conversationStarters[getRandomInt(88)]}**\n\nand we will have <@`+ newMembers[0].user.id + `> share their answer first.\n\nIf you would like another prompt, send the message "new prompt".\nIf you would like to solve a riddle, send the message "riddle me".\nIf you are finished networking, send the message "end".`)
        })
        .catch(console.error);

        await guild.channels.create("networking "+ j, { type: "voice", 
                                                            parent: "855232209916002315", 
                                                            permissionOverwrites: [
                                                                {
                                                                id: guild.id,
                                                                deny: ['CONNECT', 'VIEW_CHANNEL'],
                                                            },
                                                            ],})
        .then(channel => {
            addVoiceMembers(newMembers, channel) 
        })
        .catch(console.error);
}

function addTextMembers(newMembers, channel){ 
    newMembers.forEach(member => { channel.updateOverwrite(member, 
                    { 
                        SEND_MESSAGES: true,
                        VIEW_CHANNEL: true
                    })
    })
}

function addVoiceMembers(newMembers, channel){ 
    newMembers.forEach(member => { channel.updateOverwrite(member, 
                    { 
                        CONNECT: true,
                        VIEW_CHANNEL: true
                    })
    })
}

function deleteChannels(message){
    let number = message.channel.name.replace("networking-", "")
    let vChannel = message.channel.guild.channels.cache.find(r => r.name === `networking ${number}`);
    vChannel.delete()
    message.channel.delete()
}

function deleteAllChannels(message) {
    const voiceRegex = /(networking )\d/g;
    const textRegex = /(networking-)\d/g;
    const channelsToDelete = message.channel.guild.channels.cache.filter(c => (c.name.match(voiceRegex) || c.name.match(textRegex)));
    channelsToDelete.forEach(c => c.delete());
}

client.on('ready', () => {
    console.log(`${client.user.tag} has logged in.`)
})

client.on('message', (message) => {
    if (!message.author.bot) {
        if (message.content.toLowerCase().includes('new prompt') && message.channel.name.includes('networking')) {
            message.channel.send(`New Prompt: **${conversationStarters[getRandomInt(88)]}**`)
        }
        if (message.content.toLowerCase().includes('network') && message.channel.name.includes('general') && message.mentions.has('855097430999826482')) {
            let args = message.content.toLowerCase().split('--')[1];
            message.delete();
            if (args) {
                createChannels(message, parseInt(args))
            } else {
                createChannels(message, null)
            }
        }
        if (message.content.toLowerCase() === 'end' && message.channel.name.includes('networking')) {
            let filter = m => m.author.id === message.author.id;
            message.channel.send("Are you sure you are done netWorking? ('Yes'/'No')").then(() => {
                message.channel.awaitMessages(filter, {
                    max: 1,
                    time: 10000,
                    errors: ["time"]
                })
                .then(message => {
                    message = message.first()
                    if (message.content.toUpperCase() == "YES" || message.content.toUpperCase() == "Y") {
                    message.channel.send(`Deleted`)
                    deleteChannels(message)
                    } else if (message.content.toUpperCase() == "NO" || message.content.toUpperCase() == "N") {
                    message.channel.send("Resuming netWorking.")
                    } else {
                    message.channel.send("Invalid Response: Resuming netWorking.")
                    }
                })
                .catch(collected => {
                    message.channel.send("Timeout: Resuming netWorking.");
                });
            })

        }
        if (message.content.toLowerCase().includes('delete all') && message.mentions.has('855097430999826482')) {
            if (message.member.hasPermission('ADMINISTRATOR')) {
                message.delete();
                deleteAllChannels(message)
            } else {
                message.reply('You do not have permission to execute this action.')
            }
        }
        if (message.content.toLowerCase() === 'riddle me' && message.channel.name.includes('networking')) {
            let riddleNum = getRandomInt(18)
            message.channel.send(`Here's your riddle: **${riddles[riddleNum]}**\n\nThe answer will be revealed in 5 seconds.`)
            setTimeout(() => {  message.channel.send(`Answer: **${riddleAnswers[riddleNum]}**`) }, 5000)
        }
    }
});

client.login(process.env.DISCORDJS_BOT_TOKEN);
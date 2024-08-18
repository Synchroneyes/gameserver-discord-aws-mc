// Import required AWS SDK clients and commands for Node.js
const {PermissionsBitField, ChannelType } = require('discord.js');

require('dotenv').config()

let guild = {}

const init = async(guilds) => {
    guild = guilds.cache.get(process.env.DISCORD_GUILD_ID)
}

/**
 * The function `leaveUnwantedGuilds` iterates through the client's guilds and leaves any guild that
 * does not match a specified ID.
 * @param client - The `client` parameter is typically an instance of the Discord.js Client class,
 * which represents a connection to the Discord API and allows you to interact with Discord servers,
 * channels, users, etc.
 */
const leaveUnwantedGuilds = async (client) => {
    const guilds = client.guilds.cache.map(guild => ({
        name: guild.name,
        id: guild.id
    }))

    for(let index in guilds){
        let _guild = guilds[index]
        if(_guild.id !== process.env.DISCORD_GUILD_ID){
            console.log("Leaving guild", _guild.name)
            await client.guilds.cache.get(_guild.id).leave()
        }
    }
}

/**
 * The function `createChannel` asynchronously creates a new text channel in a Discord guild with
 * specific permissions.
 * @param requesterId - The `requesterId` parameter in the `createChannel` function represents the ID
 * of the user who is requesting the creation of a new channel. This ID is used to set specific
 * permissions for this user on the newly created channel.
 * @param message - The `message` parameter in the `createChannel` function represents the name of the
 * channel that will be created in the Discord server. It is the text that will be used as the name of
 * the new channel.
 * @returns The `createChannel` function returns the ID of the newly created channel.
 */
const createChannel = async (requesterId, message) => {
    const newChannel = await guild.channels.create({
        name: message,
        type: ChannelType.GuildText, // Use ChannelType.GuildText for a text channel
        parent: process.env.DISCORD_GAMESERVER_CATEGORY_ID, // Set the parent category ID
        permissionOverwrites: [
            {
                id: guild.id, // Administrateur role
                deny: [PermissionsBitField.Flags.ViewChannel],
            }, 
            {
                id: guild.roles.cache.get(process.env.DISCORD_ADMIN_ROLE_ID), // Administrateur role
                allow: [PermissionsBitField.Flags.ViewChannel],
            }, 
            {
                id: requesterId, // Administrateur role
                allow: [PermissionsBitField.Flags.ViewChannel],
            }
        ],
    });

    return newChannel.id;
};

/**
 * The function `sendMessage` sends a message to a specific channel in a guild asynchronously.
 * @param channelId - The `channelId` parameter is the unique identifier of the channel where you want
 * to send the message.
 * @param message - The `message` parameter in the `sendMessage` function represents the content of the
 * message that you want to send to a specific channel in a guild. It could be a text message, an
 * embed, or any other type of content that can be sent through a Discord channel.
 */
const sendMessage = async (channelId, message) => {
    let channel = await guild.channels.cache.get(channelId);
    channel.send(message);
};


/**
 * The function `sendEmbedMessage` sends an embedded message to a specified channel with a title,
 * description, and fields.
 * @param channelId - The `channelId` parameter in the `sendEmbedMessage` function is the ID of the
 * Discord channel where you want to send the embedded message.
 * @param title - The `title` parameter in the `sendEmbedMessage` function is a string that represents
 * the title of the embedded message that will be sent to the specified channel.
 * @param description - The `description` parameter in the `sendEmbedMessage` function is a string that
 * represents the main content or body of the embed message that will be sent to the specified channel.
 * It typically provides additional information or details related to the title of the embed message.
 * @param fields - The `fields` parameter in the `sendEmbedMessage` function is an array that contains
 * objects representing fields to be included in the embed message. 
 */
const sendEmbedMessage = async (channelId, title, description, fields) => {
    let channel = await guild.channels.cache.get(channelId);
    
    let embedMessage = {
        color: 0x0099ff,
        title: title,
        description: description,
        fields: fields
    }

    channel.send({embeds: [embedMessage]});


};


/**
 * The function `getUser` asynchronously fetches a user from a guild using their user ID.
 * @param userId - The `userId` parameter in the `getUser` function is used to specify the unique
 * identifier of the user whose information is being retrieved.
 * @returns The `getUser` function is returning a Promise that resolves to the member object
 * corresponding to the `userId` fetched from the guild.
 */
const getUser = async (userId) => {
    return await guild.members.fetch(userId);
}


/**
 * The function `deleteChannel` asynchronously deletes a channel with the specified `channelId` from
 * the guild.
 * @param channelId - The `channelId` parameter is the unique identifier of the channel that you want
 * to delete.
 */
const deleteChannel = async (channelId) => {
    let channel = await guild.channels.cache.get(channelId);
    channel.delete();
};

module.exports = { getUser, createChannel, sendMessage, deleteChannel, init, leaveUnwantedGuilds, sendEmbedMessage};
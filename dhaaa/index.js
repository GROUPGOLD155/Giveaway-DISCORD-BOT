const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { token, prefix, giveawayChannelId, adminRoleId } = require('./config');
const figlet = require('figlet');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

let giveawayDetails = {
  description: "Welcome to the amazing giveaway! Organized by Dhiaa DV.",
  participants: [],
  winners: [],
  endTime: new Date().getTime() + 86400000, // 24 hours from now
};

client.once('ready', () => {
  console.log(figlet.textSync('Dhiaa DV', { horizontalLayout: 'full' }));
  console.log("===================================================");
  console.log("Dhiaa DV's Giveaway Bot is now online!");
  console.log("Invite the bot using the link below:");
  console.log(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`);
  console.log("===================================================");
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  if (command === 'start') {
    if (!message.member.roles.cache.has(adminRoleId)) {
      return message.reply('Dhiaa DV says: You do not have permission to start a giveaway.');
    }

    const channel = client.channels.cache.get(giveawayChannelId);
    if (!channel) {
      return message.reply('Dhiaa DV says: Giveaway channel not found. Please check the configuration.');
    }

    const embed = new EmbedBuilder()
      .setColor(0x0000ff) // Blue color for a fresh style
      .setTitle('✨ Giveaway by Dhiaa DV! ✨')
      .setDescription(`${giveawayDetails.description}\n\n**How to participate:** Select your choice from the dropdown menu below to enter.`)
      .addFields(
        { name: 'Participants', value: `${giveawayDetails.participants.length}`, inline: true },
        { name: 'Winners', value: `${giveawayDetails.winners.length ? giveawayDetails.winners.join(', ') : 'TBD'}`, inline: true },
        { name: 'End Time', value: `<t:${Math.floor(giveawayDetails.endTime / 1000)}:R>`, inline: true }
      )
      .setFooter({ text: 'Brought to you by Dhiaa DV' });

    const row = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('giveaway_participation')
          .setPlaceholder('Select to participate')
          .addOptions([
            { label: 'Option 1', description: 'Participate in the giveaway!', value: 'participate' },
          ])
      );

    await channel.send({ embeds: [embed], components: [row] });
  } else if (command === 'stats') {
    const statsEmbed = new EmbedBuilder()
      .setColor(0x00ff00) // Green color
      .setTitle('📊 Giveaway Stats by Dhiaa DV 📊')
      .addFields(
        { name: 'Total Participants', value: `${giveawayDetails.participants.length}`, inline: true },
        { name: 'Total Entries', value: `${giveawayDetails.participants.length}`, inline: true }
      );

    message.channel.send({ embeds: [statsEmbed] });
  } else if (command === 'log') {
    message.reply(`Dhiaa DV Log:\nParticipants: ${giveawayDetails.participants.join(', ')}\nWinners: ${giveawayDetails.winners.join(', ')}`);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId === 'giveaway_participation') {
    if (!giveawayDetails.participants.includes(interaction.user.tag)) {
      giveawayDetails.participants.push(interaction.user.tag);
      await interaction.reply({ content: 'You have successfully entered the giveaway! 🎉', ephemeral: true });
    } else {
      await interaction.reply({ content: 'You are already participating in the giveaway.', ephemeral: true });
    }
  }
});

client.on('guildMemberAdd', (member) => {
  console.log(`Welcome ${member.user.tag}! Dhiaa DV appreciates your presence.`);
});

client.login(token);
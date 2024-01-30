import Discord from 'discord.js';
import Config from '../../config';

export const discordLiveNotificationWebhook = (streamTitle: string, streamUrl: string): void => {
  const webhook = Config.webhooks.discord_stream_notification;

  if (webhook.enabled) {
    const webhookClient = new Discord.WebhookClient({
      id: webhook.id,
      token: webhook.token,
    });

    // In this notification, I mention a role using the role ID then send the stream URL and title.
    // Replace this ID with the ID of your notifcation role.
    // Do not remove the <@& and >, this is how you mention a role.
    // If you want to mention a user specifically, use <@ and > instead: <@USER_ID_HERE>
    // TODO: Move this to the config file
    void webhookClient.send({
      content: `<@&867798199460036648> ${streamUrl} ${streamTitle}`,
    });
  }
};

using FeedMe.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebPush;

namespace FeedMe.Services
{
    public interface ISubscriptionService
    {
        Task NotifyUsers(Article article);
    }
    public class SubscriptionService : ISubscriptionService
    {
        private IConfiguration _conf;
        private FeedMeContext db;
        public SubscriptionService(IConfiguration configuration, FeedMeContext context)
        {
            _conf = configuration;
            db = context; 
        }

        public async Task NotifyUsers(Article article)
        {
            var subscriptions = await db.UserSubscribedFeeds.Where(uf => uf.FeedId == article.FeedId)
                                            .Join(db.Subscriptions, uf => uf.UserId, s => s.UserId, (uf, s) => s)
                                            .ToListAsync();
            foreach (var s in subscriptions)
                await SendNotification(s, article);
        }

        private async Task SendNotification(Subscription s, Article article)
        {
            var subscription = new PushSubscription(s.endpoint, s.p256dh, s.auth);
            var vapidDetails = new VapidDetails(_conf["Push:subject"], _conf["Push:publicKey"], _conf["Push:privateKey"]);
            var webPushClient = new WebPushClient();
            var payload = JsonConvert.SerializeObject(new { feedId = article.FeedId, articleId = article.ArticleId, title = article.Title });
            try
            {
                await webPushClient.SendNotificationAsync(subscription, payload, vapidDetails);
            }
            catch (WebPushException exception)
            {
                Console.WriteLine("Http STATUS code" + exception.StatusCode);
            }
        }
    }
}

using FeedMe.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FeedMe.Controllers
{
    [Route("api/[controller]")]
    public class SubscriptionsController : Controller
    {
        private FeedMeContext db;
        private UserManager<User> _userManager;
        public SubscriptionsController(FeedMeContext context, UserManager<User> user)
        {
            db = context;
            _userManager = user;
        }

        [Route("Subscribe")]
        [HttpPost]
        public async Task<IActionResult> Subscribe(ClientSubscription sub)
        {
            var user = await _userManager.GetUserAsync(User);

            var subscription = new Subscription
            {
                UserId = user.UserId,
                p256dh = sub.p256dh,
                auth = sub.auth,
                endpoint = sub.endpoint
            };
            db.Subscriptions.Add(subscription);
            await db.SaveChangesAsync();
            return Ok(subscription);
        }
        [Route("Unsubscribe")]
        [HttpPost]
        public async Task<IActionResult> Unsubscribe(ClientSubscription sub)
        {
            var user = await _userManager.GetUserAsync(User);

            var subscription = await db.Subscriptions.FirstOrDefaultAsync(s => s.UserId == user.UserId && s.auth == sub.auth);
            db.Subscriptions.Remove(subscription);
            await db.SaveChangesAsync();
            return Ok();
        }

        [Route("Feed")]
        [HttpPost]
        public async Task<IActionResult> SubscribeFeed([FromBody] (int feedId, bool subscribe) data)
        {
            var user = await _userManager.GetUserAsync(User);
            if (data.subscribe)
            {
                var subscribedFeed = new UserSubscribedFeed
                {
                    UserId = user.UserId,
                    FeedId = data.feedId
                };
                db.UserSubscribedFeeds.Add(subscribedFeed);
            }
            else
            {
                var subscribedFeed = await db.UserSubscribedFeeds.FirstOrDefaultAsync(uf => uf.FeedId == data.feedId && uf.UserId == user.UserId);
                db.UserSubscribedFeeds.Remove(subscribedFeed);
            }
            await db.SaveChangesAsync();
            return Ok();
        }
    }
}

public class ClientSubscription
{
    public string endpoint { get; set; }
    public string p256dh { get; set; }
    public string auth { get; set; }
}

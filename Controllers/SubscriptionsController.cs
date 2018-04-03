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
        public async Task<IActionResult> Subscribe([FromBody] ClientSubscription sub)
        {
            //var user = await _userManager.GetUserAsync(User);
            var user = await db.Users.FirstOrDefaultAsync();
            var subscription = new Subscription
            {
                UserId = user.UserId,
                p256dh = sub.keys.p256dh,
                auth = sub.keys.auth,
                endpoint = sub.endpoint
            };
            db.Subscriptions.Add(subscription);
            await db.SaveChangesAsync();
            return Ok(subscription);
        }
        [Route("Unsubscribe")]
        [HttpPost]
        public async Task<IActionResult> Unsubscribe([FromBody] ClientSubscription sub)
        {
            //var user = await _userManager.GetUserAsync(User);
            var user = await db.Users.FirstOrDefaultAsync();

            var subscription = await db.Subscriptions.FirstOrDefaultAsync(s => s.UserId == user.UserId && s.auth == sub.keys.auth);
            db.Subscriptions.Remove(subscription);
            await db.SaveChangesAsync();
            return Ok();
        }

        [Route("Feed")]
        [HttpPost]
        public async Task<IActionResult> SubscribeFeed([FromBody] FeedSubscription data)
        {
            //var user = await _userManager.GetUserAsync(User);
            var user = await db.Users.FirstOrDefaultAsync();

            var subsc = await db.Subscriptions.FirstOrDefaultAsync(s => s.UserId == user.UserId && s.auth == data.subscription.keys.auth);
            if (subsc == null)
                return NotFound();
            if (data.subscribe)
            {
                var subscribedFeed = new UserSubscribedFeed
                {
                    UserId = user.UserId,
                    FeedId = data.feedId,
                    SubscriptionId = subsc.SubscriptionId
                };
                db.UserSubscribedFeeds.Add(subscribedFeed);
            }
            else
            {
                var subscribedFeed = await db.UserSubscribedFeeds.FirstOrDefaultAsync(uf => uf.FeedId == data.feedId && uf.UserId == user.UserId && uf.SubscriptionId == subsc.SubscriptionId);
                db.UserSubscribedFeeds.Remove(subscribedFeed);
            }
            await db.SaveChangesAsync();
            return Ok();
        }

        [Route("DefaultUser")]
        [HttpGet]
        public async Task<IActionResult> AddDefaultUser()
        {
            db.Users.Add(new Models.User
            {
                Email = "jeremie.loscos@expaceo.com",
                UserName = "j.loscos"
            });
            
            await db.SaveChangesAsync();
            return Ok();
        }
    }
}

public class FeedSubscription
{
    public int feedId { get; set; }
    public bool subscribe { get; set; }
    public ClientSubscription subscription { get; set; }
}
public class ClientSubscription
{
    public string endpoint { get; set; }
    public ClientSubscriptionKeys keys { get; set; }
}
public class ClientSubscriptionKeys
{
    public string p256dh { get; set; }
    public string auth { get; set; }
}

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace FeedMe.Models
{
    public class UserSubscribedFeed
    {
        [Key]
        public int UserFeedId { get; set; }
        public int? UserId { get; set; }
        public virtual User User { get; set; }
        public int SubscriptionId { get; set; }
        public Subscription Subscription { get; set; }
        public int FeedId { get; set; }
        public virtual Feed Feed { get; set; }
    }
}

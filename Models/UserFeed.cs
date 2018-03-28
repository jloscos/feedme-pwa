using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FeedMe.Models
{
    public class UserFeed
    {
        public int UserFeedId { get; set; }
        public int UserId { get; set; }
        public int FeedId { get; set; }
        public string Subscription { get; set; }
    }
}

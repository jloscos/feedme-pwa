using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FeedMe.Models
{
    public class Feed
    {
        public int FeedId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }

        public string FeedUrl { get; set; }
        public string Link { get; set; }
        public DateTime LastUpdate { get; set; }

        public virtual ICollection<Article> Articles { get; set; }
    }
}

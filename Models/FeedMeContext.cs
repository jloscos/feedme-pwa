using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FeedMe.Models
{
    public class FeedMeContext : DbContext
    {
        public FeedMeContext(DbContextOptions options) : base(options)
        {
            //Database.EnsureCreated();
            //if (Database.GetPendingMigrations().Count() > 0)
            //    Database.Migrate();
        }
        public DbSet<Article> Articles { get; set; }
        public DbSet<Feed> Feeds { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserSubscribedFeed> UserSubscribedFeeds { get; set; }
        public DbSet<Subscription> Subscriptions { get; set; }

        public DbSet<UserArticleRead> UserArticlesRead { get; set; }
    }
}

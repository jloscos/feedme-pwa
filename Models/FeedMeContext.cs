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
            Database.EnsureCreated();
        }
        public DbSet<Article> Articles { get; set; }
        public DbSet<Feed> Feeds { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserSubscribedFeed> UserSubscribedFeeds { get; set; }
        public DbSet<Subscription> Subscriptions { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Feed>().ToTable("Feeds").HasMany(f => f.Articles).WithOne(a => a.Feed);
            builder.Entity<Feed>().HasKey(f => f.FeedId);
            builder.Entity<Feed>().Property(f => f.Title).IsRequired();

            builder.Entity<Article>().ToTable("Articles").HasKey(a => a.ArticleId);
            builder.Entity<Article>().Property(a => a.Title).IsRequired();
            builder.Entity<Article>().Property(a => a.PublishDate).IsRequired().HasDefaultValueSql("GetDate()");
            builder.Entity<Article>().HasAlternateKey(a => new { a.FeedId, a.PublishDate, a.Title });

            builder.Entity<User>().ToTable("Users");
            builder.Entity<User>().HasKey(u => u.UserId);

        }
    }
}

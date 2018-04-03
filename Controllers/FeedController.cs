using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using FeedMe.Models;
using FeedMe.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FeedMe.Controllers
{
    [Route("api/[controller]")]
    public class FeedController : Controller
    {
        private FeedMeContext db;
        private IFeedService _feed;
        private ISubscriptionService _subscription;
        public FeedController(FeedMeContext context, IFeedService feedService, ISubscriptionService subscriptionService)
        {
            db = context;
            _feed = feedService;
            _subscription = subscriptionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetFeeds()
        {
            var feeds = await db.Feeds.ToListAsync();
            return Ok(feeds);
        }

        [HttpGet]
        [Route("Articles")]
        public async Task<IActionResult> GetArticles(int page = 0)
        {
            var user = await db.Users.FirstOrDefaultAsync();

            var articles = await db.Articles
                .Select(a => Article.WithoutContent(a))
                .OrderByDescending(a => a.PublishDate)
                .Skip(page * 50)
                .Take(50)
                .ToListAsync();

            articles = articles.GroupJoin(db.UserArticlesRead.Where(r => r.UserId == user.UserId),
                                a => a.ArticleId,
                                r => r.ArticleId,
                                (a, r) => { a.Read = r.Count() > 0; return a; })
                            .ToList();
            return Ok(articles);
        }

        [HttpGet]
        [Route("{id}/Articles")]
        public async Task<IActionResult> GetFeedArticles(int id, int page = 0)
        {
            var user = await db.Users.FirstOrDefaultAsync();

            var articles = await db.Articles
                .Where(a => a.FeedId == id)
                .Select(a => Article.WithoutContent(a))
                .OrderByDescending(a => a.PublishDate)
                .Skip(page * 50)
                .Take(50)
                .ToListAsync();
            articles = articles.GroupJoin(db.UserArticlesRead.Where(r => r.UserId == user.UserId),
                    a => a.ArticleId,
                    r => r.ArticleId,
                    (a, r) => { a.Read = r.Count() > 0; return a; })
                .ToList();
            return Ok(articles);
        }

        [HttpGet]
        [Route("Article/{articleId}")]
        public async Task<IActionResult> GetArticle(int articleId)
        {
            var article = await db.Articles.FindAsync(articleId);
            if (article == null)
                return NotFound();
            return Ok(article);
        }
        [HttpGet]
        [Route("{id}/Image")]
        public async Task<IActionResult> GetFeedImage(int id)
        {
            var feed = await db.Feeds.FindAsync(id);
            if (feed == null)
                return NotFound();
            var req = WebRequest.Create(feed.ImageUrl);
            using (var response = await req.GetResponseAsync())
            {
                using (var stream = response.GetResponseStream())
                {
                    var ms = new MemoryStream();
                    await stream.CopyToAsync(ms);
                    ms.Seek(0, SeekOrigin.Begin);
                    return File(ms, response.ContentType);
                }
            }
        }

        [HttpGet]
        [Route("Article/{articleId}/Image")]
        public async Task<IActionResult> GetArticleImage(int articleId)
        {
            var article = await db.Articles.FindAsync(articleId);
            if (article == null || article.Image == null)
                return NotFound();
            var req = WebRequest.Create(article.Image);
            using (var response = await req.GetResponseAsync())
            {
                using (var stream = response.GetResponseStream())
                {
                    var ms = new MemoryStream();
                    await stream.CopyToAsync(ms);
                    ms.Seek(0, SeekOrigin.Begin);
                    return File(ms, response.ContentType);
                }
            }
        }


        [HttpGet]
        [Route("Add")]
        public async Task<IActionResult> AddFeed(string url)
        {
            var feed = await _feed.GetFeed(url);
            db.Feeds.Add(feed);
            await db.SaveChangesAsync();
            return Ok(feed);
        }


        [HttpGet]
        [Route("Refresh")]
        public async Task<IActionResult> RefreshFeeds()
        {
            var feeds = db.Feeds.ToList();
            foreach (var feed in feeds)
            {
                var articles = await _feed.GetArticlesFromFeed(feed);
                var newArticles = articles.Where(a => a.PublishDate > feed.LastUpdate && !db.Articles.Any(d => d.ArticleId == a.ArticleId));
                
                if (newArticles.Count() > 0)
                {
                    db.Articles.AddRange(newArticles);
                    var lastArticle = newArticles.OrderByDescending(a => a.PublishDate).First();
                    await _subscription.NotifyUsers(lastArticle);
                }
                feed.LastUpdate = DateTime.Now;
                await db.SaveChangesAsync();
            }
            return Ok();
        }

        [HttpPost]
        [Route("Article/{articleId}/Read")]
        public async Task<IActionResult> MarkAsRead(int articleId)
        {
            var user = await db.Users.FirstOrDefaultAsync();
            var article = await db.Articles.FindAsync(articleId);
            if (article == null)
                return NotFound();

            db.UserArticlesRead.Add(new UserArticleRead
            {
                ArticleId = articleId,
                UserId = user.UserId,
                DateRead = DateTime.Now,
            });
            await db.SaveChangesAsync();
            return Ok(article);
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FeedMe.Models;
using FeedMe.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FeedMe.Controllers
{
    [Route("api/[controller]")]
    public class FeedController : Controller
    {
        private FeedMeContext db;
        private IFeedService _feed;
        public FeedController(FeedMeContext context, IFeedService feedService)
        {
            db = context;
            _feed = feedService;
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
            var articles = await db.Articles
                .Select(a => Article.WithoutContent(a))
                .OrderByDescending(a => a.PublishDate)
                .Skip(page * 20)
                .Take(20)
                .ToListAsync();
            return Ok(articles);
        }

        [HttpGet]
        [Route("{id}/Articles")]
        public async Task<IActionResult> GetFeedArticles(int id, int page = 0)
        {
            var articles = await db.Articles
                .Where(a => a.FeedId == id)
                .Select(a => Article.WithoutContent(a))
                .OrderByDescending(a => a.PublishDate)
                .Skip(page * 20)
                .Take(20)
                .ToListAsync();
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
        [Route("Add")]
        public async Task<IActionResult> AddFeed(string url)
        {
            var feed = await _feed.GetFeed(url);
            db.Feeds.Add(feed);
            await db.SaveChangesAsync();
            return Ok(feed);
        }


        [HttpGet]
        [Route("{id}/Refresh")]
        public async Task<IActionResult> RefreshFeed(int id)
        {
            var feed = await db.Feeds.FindAsync(id);
            if (feed == null)
                return NotFound();
            var articles = await _feed.GetArticlesFromFeed(feed);
            db.Articles.AddRange(articles.Where(a => a.PublishDate > feed.LastUpdate));
            feed.LastUpdate = DateTime.Now;
            await db.SaveChangesAsync();
            return Ok();
        }
    }
}

using FeedMe.Models;
using Microsoft.SyndicationFeed;
using Microsoft.SyndicationFeed.Rss;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Xml;

namespace FeedMe.Services
{
    public interface IFeedService
    {
        Task<List<Article>> GetArticlesFromFeed(Feed feed);
        Task<Feed> GetFeed(string url);
    }
    public class FeedService : IFeedService
    {
        public async Task<Feed> GetFeed(string url)
        {
            var feed = new Feed();
            feed.FeedUrl = url;
            using (XmlReader xmlReader = XmlReader.Create(feed.FeedUrl, new XmlReaderSettings() { Async = true }))
            {
                var reader = new RssFeedReader(xmlReader);

                while (await reader.Read())
                {
                    switch (reader.ElementType)
                    {
                        case SyndicationElementType.Content:
                            var content = await reader.ReadContent();
                            if (content.Name == "title")
                                feed.Title = content.Value;
                            else if (content.Name == "description")
                                feed.Description = content.Value;
                            break;
                        case SyndicationElementType.Image:
                            var img = await reader.ReadImage();
                            feed.ImageUrl = img.Url.AbsoluteUri;
                            break;
                        case SyndicationElementType.Link:
                            var link = await reader.ReadLink();
                            feed.Link = link.Uri.AbsoluteUri;
                            break;
                    }
                }
            }
            return feed;
        }
        public async Task<List<Article>> GetArticlesFromFeed(Feed feed)
        {
            List<Article> articles = new List<Article>();
            using (XmlReader xmlReader = XmlReader.Create(feed.FeedUrl, new XmlReaderSettings() { Async = true }))
            {
                var reader = new RssFeedReader(xmlReader);

                while (await reader.Read())
                {
                    if (reader.ElementType == SyndicationElementType.Item)
                    {
                        var content = await reader.ReadContent();
                        var article = mapArticle(content);
                        article.FeedId = feed.FeedId;
                        articles.Add(article);
                    }
                }
            }
            return articles;
        }

        private Article mapArticle(ISyndicationContent item)
        {
            var a = new Article();
            a.ArticleId = item.Fields.FirstOrDefault(f => f.Name == "guid").Value.GetHashCode();
            a.Title = item.Fields.FirstOrDefault(f => f.Name == "title")?.Value;
            a.Link = item.Fields.FirstOrDefault(f => f.Name == "link")?.Value;
            a.Content = item.Fields.FirstOrDefault(f => f.Name == "encoded")?.Value;
            string pubDate = item.Fields.FirstOrDefault(f => f.Name == "pubDate")?.Value;
            if (DateTime.TryParse(pubDate, out DateTime date))
                a.PublishDate = date;
            a.Creator = item.Fields.FirstOrDefault(f => f.Name == "creator")?.Value;
            a.Description = item.Fields.FirstOrDefault(f => f.Name == "description")?.Value;

            Regex regex;
            regex = new Regex("<a[^>]+>Read more</a>");
            if (a.Description != null)
                a.Description = regex.Replace(a.Description, "");
            regex = new Regex("<img[^>]+src=\"([^\"]+)\"");
            var match = regex.Match(a.Content);
            if (match.Success)
                a.Image = match.Groups[1].Value;
            return a;
        }
    }
}

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace FeedMe.Models
{
    public class Article
    {
        [Key]
        public int ArticleId { get; set; }
        public int FeedId { get; set; }

        public virtual Feed Feed { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Link { get; set; }
        public DateTime PublishDate { get; set; }
        public string Creator { get; set; }
        public string Content { get; set; }

        public string Image { get; set; }

        public static Article WithoutContent(Article a)
        {
            return new Article
            {
                ArticleId = a.ArticleId,
                Creator = a.Creator,
                Description = a.Description,
                FeedId = a.FeedId,
                Image = a.Image,
                Link = a.Link,
                PublishDate = a.PublishDate,
                Title = a.Title
            };
        }
    }
}
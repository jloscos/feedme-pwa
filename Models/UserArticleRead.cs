using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace FeedMe.Models
{
    public class UserArticleRead
    {
        [Key]
        public int UserArticleReadId { get; set; }
        public int UserId { get; set; }
        public virtual User User { get; set; }
        public int ArticleId { get; set; }
        public virtual Article Article { get; set; }
        public DateTime DateRead { get; set; }
    }
}

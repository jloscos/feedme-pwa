using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace FeedMe.Models
{
    public class Subscription
    {
        [Key]
        public int SubscriptionId { get; set; }
        public int UserId { get; set; }

        public virtual User User { get; set; }
        [Required]
        public string endpoint { get; set; }
        [Required]
        public string p256dh { get; set; }
        [Required]
        public string auth { get; set; }
    }
}

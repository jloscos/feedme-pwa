using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace FeedMe.Controllers
{
    [Route("Home")]
    public class HomeController : Controller
    {
        [Route("site.webmanifest")]
        public IActionResult Manifest()
        {
            return File("~/assets/site.webmanifest", "application/manifest+json");
        }
    }
}

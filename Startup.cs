using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FeedMe.Models;
using FeedMe.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FeedMe
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();
            services.AddEntityFrameworkSqlServer();
            services.AddDbContext<FeedMe.Models.FeedMeContext>(o => o.UseSqlServer(Configuration.GetConnectionString("FeedMeDB")));
            services.AddTransient<IFeedService, FeedService>();
            services.AddTransient<ISubscriptionService, SubscriptionService>();

            services.AddIdentity<User, IdentityRole>()
                .AddEntityFrameworkStores<FeedMeContext>()
                .AddDefaultTokenProviders();

            /*
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddOpenIdConnect(opt =>
            {
                opt.Authority = "https://login.microsoftonline.com/comon";
                opt.ClientId = Configuration["Authentication:Microsoft:ClientId"];
                opt.ClientSecret = Configuration["Authentication:Microsoft:ClientSecret"];

                opt.Events = new OpenIdConnectEvents
                {
                    OnMessageReceived = async ctx =>
                    {
                        ctx.GetType();
                    },
                    OnTokenValidated = async ctx =>
                    {
                        ctx.GetType();
                    },
                    OnAuthenticationFailed = async ctx =>
                    {
                        ctx.GetType();
                    }
                };
            });
            */
            //services.AddAuthentication().AddMicrosoftAccount(opt =>
            //{
            //    opt.ClientId = Configuration["Authentication:Microsoft:ClientId"];
            //    opt.ClientSecret = Configuration["Authentication:Microsoft:ClientSecret"];
            //});

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            app.UseAuthentication();
            app.UseMvc();
            app.UseDefaultFiles();
            app.UseStaticFiles();
        }
    }
}

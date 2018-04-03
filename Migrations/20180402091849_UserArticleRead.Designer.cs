﻿// <auto-generated />
using FeedMe.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.EntityFrameworkCore.Storage.Internal;
using System;

namespace FeedMe.Migrations
{
    [DbContext(typeof(FeedMeContext))]
    [Migration("20180402091849_UserArticleRead")]
    partial class UserArticleRead
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.0.2-rtm-10011")
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("FeedMe.Models.Article", b =>
                {
                    b.Property<int>("ArticleId")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Content")
                        .IsRequired();

                    b.Property<string>("Creator");

                    b.Property<string>("Description");

                    b.Property<int>("FeedId");

                    b.Property<string>("Image");

                    b.Property<string>("Link");

                    b.Property<DateTime>("PublishDate");

                    b.Property<string>("Title")
                        .IsRequired();

                    b.HasKey("ArticleId");

                    b.HasIndex("FeedId");

                    b.ToTable("Articles");
                });

            modelBuilder.Entity("FeedMe.Models.Feed", b =>
                {
                    b.Property<int>("FeedId")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Description");

                    b.Property<string>("FeedUrl");

                    b.Property<string>("ImageUrl");

                    b.Property<DateTime>("LastUpdate");

                    b.Property<string>("Link");

                    b.Property<string>("Title")
                        .IsRequired();

                    b.HasKey("FeedId");

                    b.ToTable("Feeds");
                });

            modelBuilder.Entity("FeedMe.Models.Subscription", b =>
                {
                    b.Property<int>("SubscriptionId")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("UserId");

                    b.Property<string>("auth")
                        .IsRequired();

                    b.Property<string>("endpoint")
                        .IsRequired();

                    b.Property<string>("p256dh")
                        .IsRequired();

                    b.HasKey("SubscriptionId");

                    b.HasIndex("UserId");

                    b.ToTable("Subscriptions");
                });

            modelBuilder.Entity("FeedMe.Models.User", b =>
                {
                    b.Property<int>("UserId")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("AccessFailedCount");

                    b.Property<string>("ConcurrencyStamp");

                    b.Property<string>("Email");

                    b.Property<bool>("EmailConfirmed");

                    b.Property<string>("Id");

                    b.Property<bool>("LockoutEnabled");

                    b.Property<DateTimeOffset?>("LockoutEnd");

                    b.Property<string>("NormalizedEmail");

                    b.Property<string>("NormalizedUserName");

                    b.Property<string>("PasswordHash");

                    b.Property<string>("PhoneNumber");

                    b.Property<bool>("PhoneNumberConfirmed");

                    b.Property<string>("SecurityStamp");

                    b.Property<bool>("TwoFactorEnabled");

                    b.Property<string>("UserName");

                    b.HasKey("UserId");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("FeedMe.Models.UserArticleRead", b =>
                {
                    b.Property<int>("UserArticleReadId")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("ArticleId");

                    b.Property<DateTime>("DateRead");

                    b.Property<int>("UserId");

                    b.HasKey("UserArticleReadId");

                    b.HasIndex("ArticleId");

                    b.HasIndex("UserId");

                    b.ToTable("UserArticlesRead");
                });

            modelBuilder.Entity("FeedMe.Models.UserSubscribedFeed", b =>
                {
                    b.Property<int>("UserFeedId")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("FeedId");

                    b.Property<int>("SubscriptionId");

                    b.Property<int?>("UserId");

                    b.HasKey("UserFeedId");

                    b.HasIndex("FeedId");

                    b.HasIndex("SubscriptionId");

                    b.HasIndex("UserId");

                    b.ToTable("UserSubscribedFeeds");
                });

            modelBuilder.Entity("FeedMe.Models.Article", b =>
                {
                    b.HasOne("FeedMe.Models.Feed", "Feed")
                        .WithMany("Articles")
                        .HasForeignKey("FeedId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("FeedMe.Models.Subscription", b =>
                {
                    b.HasOne("FeedMe.Models.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("FeedMe.Models.UserArticleRead", b =>
                {
                    b.HasOne("FeedMe.Models.Article", "Article")
                        .WithMany()
                        .HasForeignKey("ArticleId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("FeedMe.Models.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("FeedMe.Models.UserSubscribedFeed", b =>
                {
                    b.HasOne("FeedMe.Models.Feed", "Feed")
                        .WithMany()
                        .HasForeignKey("FeedId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("FeedMe.Models.Subscription", "Subscription")
                        .WithMany()
                        .HasForeignKey("SubscriptionId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("FeedMe.Models.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId");
                });
#pragma warning restore 612, 618
        }
    }
}

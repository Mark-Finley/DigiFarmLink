You are my senior software engineer, solution architect, UI/UX designer, and technical co-founder.

We are participating in a 48-hour hackathon.

Our objective is NOT to build a production-scale application.

Our objective is to build a polished, modern, fully functional MVP that demonstrates the complete business workflow and impresses judges during a live demo.

Throughout this project, always prioritize:

• Clean architecture
• Fast development
• Reusable code
• Beautiful UI
• Responsive design
• Maintainability
• Simplicity over complexity
• Working features over perfect features

Never over-engineer solutions.

Always choose the simplest approach that works.

-------------------------------------------------------
PROJECT
-------------------------------------------------------

Project Name

FarmLink Ghana

Tagline

Connecting Farmers, Buyers and Transporters.

-------------------------------------------------------
PROBLEM
-------------------------------------------------------

Smallholder vegetable farmers struggle to:

• Find buyers
• Sell produce quickly
• Receive fair prices
• Arrange transportation

Buyers struggle to:

• Find nearby farmers
• Compare prices
• Trust suppliers
• Receive deliveries on time

Transport providers have no centralized platform to receive delivery requests.

The application should solve these problems.

-------------------------------------------------------
TARGET REGION
-------------------------------------------------------

Focus only on one agricultural region.

Ashanti Region (Kumasi supply corridor)

Design the system so additional regions can easily be added later.

-------------------------------------------------------
USERS
-------------------------------------------------------

There are only four user roles.

1 Farmer

2 Buyer

3 Transport Provider

4 Administrator

-------------------------------------------------------
TECH STACK
-------------------------------------------------------

Use exactly this stack.

Frontend

• Next.js 15
• React
• TypeScript
• TailwindCSS
• shadcn/ui

Backend

• Next.js Route Handlers
• Server Actions

Database

• Supabase PostgreSQL

Authentication

• Supabase Auth

Storage

• Supabase Storage

Maps

• Leaflet
• OpenStreetMap

Forms

• React Hook Form
• Zod

Charts

• Recharts

Icons

• Lucide React

Deployment

• Vercel

Do NOT use Prisma.

Do NOT use NextAuth.

Do NOT use Cloudinary.

Keep dependencies minimal.

-------------------------------------------------------
APPLICATION FEATURES
-------------------------------------------------------

Landing Page

Authentication

Role Based Dashboard

Marketplace

Product Listings

Search

Filters

Cart

Checkout

Orders

Transport Requests

Reviews

Notifications

Admin Dashboard

-------------------------------------------------------
LANDING PAGE
-------------------------------------------------------

Create a beautiful homepage.

Include:

Hero

Features

How It Works

Statistics

Testimonials

Frequently Asked Questions

Call To Action

Footer

Modern animations

Responsive design

-------------------------------------------------------
FARMER FEATURES
-------------------------------------------------------

Register

Login

Profile

Upload Produce

Edit Produce

Delete Produce

View Listings

View Orders

Accept Orders

Reject Orders

Sales Summary

Notifications

-------------------------------------------------------
BUYER FEATURES
-------------------------------------------------------

Register

Login

Browse Marketplace

Search

Filter

Product Details

Add To Cart

Checkout

Place Order

Track Orders

Leave Reviews

-------------------------------------------------------
TRANSPORT FEATURES
-------------------------------------------------------

Register

Login

View Available Deliveries

Accept Delivery

Update Status

Completed Deliveries

Earnings Summary

-------------------------------------------------------
ADMIN FEATURES
-------------------------------------------------------

Dashboard

Users

Listings

Orders

Reports

Analytics

Suspend Users

Delete Listings

-------------------------------------------------------
MARKETPLACE
-------------------------------------------------------

Each produce listing contains

Photo

Name

Category

Price

Quantity

Harvest Date

Freshness

Farmer

Location

Rating

-------------------------------------------------------
ORDER WORKFLOW
-------------------------------------------------------

Buyer searches produce

↓

Views product

↓

Adds to cart

↓

Checkout

↓

Order created

↓

Farmer accepts

↓

Transport request generated

↓

Transport provider accepts

↓

Picked up

↓

In Transit

↓

Delivered

↓

Buyer confirms

↓

Buyer leaves review

-------------------------------------------------------
SMART RECOMMENDATION
-------------------------------------------------------

Do NOT use AI.

Recommend produce using a weighted score based on:

Distance

Freshness

Farmer Rating

Lowest Price

Availability

Display recommended produce first.

-------------------------------------------------------
OFFLINE SUPPORT
-------------------------------------------------------

Implement lightweight offline support.

Use localStorage.

Cache

Marketplace

User Profile

Last Search

Pending Produce Uploads

Automatically sync when internet returns.

-------------------------------------------------------
DATABASE
-------------------------------------------------------

Design Supabase tables for:

Users

Farmer Profiles

Buyer Profiles

Transport Profiles

Produce

Orders

Transport Requests

Reviews

Notifications

Admin Logs

Use UUID primary keys.

Use proper foreign keys.

Generate SQL migrations.

Generate Row Level Security policies.

-------------------------------------------------------
UI DESIGN
-------------------------------------------------------

Theme

Modern

Minimal

Agriculture inspired

Rounded cards

Soft shadows

Large spacing

Beautiful typography

Color Palette

Primary

#2E7D32

Secondary

#66BB6A

Accent

#F9A825

Background

#F8FAFC

Dark mode ready.

-------------------------------------------------------
PROJECT STRUCTURE
-------------------------------------------------------

Create a scalable folder structure.

Use feature-based architecture.

Example

app/

components/

features/

services/

hooks/

types/

utils/

supabase/

public/

-------------------------------------------------------
CODE QUALITY
-------------------------------------------------------

Use

TypeScript

Reusable Components

Server Components where appropriate

Custom Hooks

Clean Folder Structure

No duplicated logic

Strong typing

Simple APIs

Readable code

-------------------------------------------------------
SEED DATA
-------------------------------------------------------

Generate realistic Ghanaian data.

20 Farmers

15 Buyers

8 Transport Providers

100 Produce Listings

30 Orders

20 Reviews

Produce examples

Tomatoes

Pepper

Garden Eggs

Okra

Cabbage

Lettuce

Spinach

Onions

-------------------------------------------------------
IMPORTANT DEVELOPMENT RULES
-------------------------------------------------------

Never generate the entire application at once.

Work in milestones.

At the end of each milestone stop.

Wait for my approval.

Every generated file must include:

File path

File name

Purpose

-------------------------------------------------------
MILESTONES
-------------------------------------------------------

Milestone 1

Project initialization

Folder structure

Install packages

Environment variables

Supabase configuration

Milestone 2

Database design

SQL

Authentication

Seed data

Milestone 3

Shared UI Components

Navbar

Sidebar

Buttons

Cards

Forms

Layout

Milestone 4

Landing Page

Milestone 5

Authentication Pages

Milestone 6

Farmer Dashboard

Milestone 7

Marketplace

Milestone 8

Buyer Dashboard

Milestone 9

Order Workflow

Milestone 10

Transport Dashboard

Milestone 11

Admin Dashboard

Milestone 12

Final polishing

Responsiveness

Accessibility

Animations

Bug fixes

-------------------------------------------------------
YOUR ROLE
-------------------------------------------------------

Act like my senior engineer.

If a feature is too large for a hackathon, simplify it.

If there are multiple implementation options, always choose the fastest one that still demonstrates the business value.

Continuously suggest improvements that increase demo quality without significantly increasing development time.

Do not continue to the next milestone until I approve the current one.
# Event Hook - Event Booking Platform

**Developer:** Darren Anthony Beltham
**Live Demo:** https://candidate-assessment-five.vercel.app/login
**Loom Walkthrough:** https://www.loom.com/share/a7984252a5414d9fa689c05d7d5048a0

## 1. Tech Choices
**Stack:** Next.js 16 (App Router), React, Prisma ORM, PostgreSQL, NextAuth.

I chose this stack because it provides a seamless full-stack developer experience while maintaining high performance. 
* **Next.js (App Router):** Allows for server-side rendering and secure API routes in a single repository.
* **Prisma & PostgreSQL:** PostgreSQL handles the strict relational requirements (like conflict detection and capacity constraints), while Prisma ensures type safety across the entire application.
* **NextAuth:** Provides secure, standard-compliant session management and password hashing without reinventing the wheel.

## 2. Trade-offs & Architecture Decisions
* **Recurring Events (Layer 4.1):** I deliberately chose **Approach A (Materialize all)**. By generating every occurrence as an independent row upfront, I maintained strict compatibility with Layer 2 (Conflict Detection) and Layer 3 (Concurrency). While this increases database rows, it keeps query logic extremely fast and waitlist isolation pure.
* **Concurrency (Layer 3.1):** I implemented Optimistic Locking using a `version` column on the `TimeSlot` table. This prevents double-booking the last spot without the massive overhead of locking the entire table.
* **What would break under load:** Currently, pagination uses `skip` and `take`. At a scale of millions of rows, `OFFSET` pagination degrades in PostgreSQL. For true enterprise scale, I would refactor to cursor-based pagination.

## 3. Setup Instructions

### Local Development Setup

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root directory and add your database credentials:
   ```env
   DATABASE_URL="postgresql://your_user:your_password@localhost:5432/your_database"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="super_secret_key_for_local_dev"
   ```

3. **Database Sync & Seeding:**
   Push the schema to your database and run the custom seed script. The seed script generates 10,000+ events and 50,000+ bookings to test performance under load[cite: 49]:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **Start the application:**
   ```bash
   npm run dev
   ```
   *Note: Open your browser's dev tools and set the viewport to 390px (iPhone 14/15) for the intended mobile-first experience[cite: 146].*

### Live Demo & Test Credentials

You can access the live platform via the Vercel link at the top of this document[cite: 82]. 

Use the following credentials to test the core roles and scenarios[cite: 117]:

* **Admin Account** (Access to create, edit, delete events, and generate recurring series)
  * **Email:** `admin@test.com`
  * **Password:** `password123`

* **Standard User / Reviewer Account** (Use this to test bookings, waitlists, and concurrency)
  * **Email:** `reviewer1@test.com`
  * **Password:** `password123`

## 4. What I'd Improve

Given more time, the very first thing I would tackle is **using AI from the start**. 

**Why that specifically?** because I spend alot of time trying to think of the layout without using AI and thats time consuming and I can focus more on other stuff like make the UIUX more neat and better looking but because too focus on not using AI, it's slowing me down a little bit and can't finish it earlier.

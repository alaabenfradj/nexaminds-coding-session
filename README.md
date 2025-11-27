# Full-Stack Assessment — NestJS + Next.js Project

This repository contains a full-stack assessment built with **NestJS (Backend)** and **Next.js (Frontend)**.  
The goal is to evaluate practical skills across REST API development, React component architecture, Tailwind styling, debugging, request handling, search/pagination logic, and UI/UX enhancements.

The assessment includes **10 tasks** with increasing complexity.

---

# Tasks Overview

## 1. Backend — Add Pagination to GET /posts (Easy)

Enhance the existing posts endpoint with pagination.

### Requirements
- Accept `page` (default: 1) and `limit` (default: 10)
- Validate that both are positive integers
- Return:
  ```
  {
    data: Post[];
    total: number;
    page: number;
    limit: number;
  }
  ```
- Implement pagination logic in the service

### Files to Update
- backend/src/posts/posts.controller.ts
- backend/src/posts/posts.service.ts

---

## 2. Frontend — Create PostForm Component (Easy)

Build a reusable form to create new posts.

### Requirements
- Create PostForm.tsx under /frontend/app/components/
- Fields: title (text), content (textarea)
- Tailwind CSS styling
- Basic validation
- Emit form data:
  ```
  onSubmit({ title, content })
  ```

### File to Create
- frontend/app/components/PostForm.tsx

---

## 3. Frontend — Implement Post Creation API Call (Easy)

Integrate PostForm into the main page and POST to backend.

### Requirements
- Import PostForm in page.tsx
- POST to /posts
- Show success/error messages
- Optional: refresh posts after creation

### File to Modify
- frontend/app/page.tsx

---

## 4. Backend — Add Search Functionality to GET /posts (Medium)

Add backend-level filtering using a `search` query parameter.

### Requirements
- Add optional search param
- Search case-insensitive in title and content
- Combine search with pagination
- Return empty array if no matches

### Files to Modify
- backend/src/posts/posts.controller.ts
- backend/src/posts/posts.service.ts

---

## 5. Frontend — Create PostsList Component (Medium)

Display posts in a styled list with loading and error states.

### Requirements
- Create PostsList.tsx
- Fetch posts from GET /posts on mount
- Loading and error states
- Tailwind card layout

### File to Create
- frontend/app/components/PostsList.tsx

### File to Modify
- frontend/app/page.tsx

---

## 6. Backend — Implement PATCH /posts/:id (Medium)

Add an endpoint for partial updates.

### Requirements
- Create PATCH /posts/:id
- Allow updating title/content
- Return 404 if missing
- Return updated post
- Use DTO validation

### Files to Modify/Create
- backend/src/posts/posts.controller.ts
- backend/src/posts/posts.service.ts
- backend/src/posts/dto/update-post.dto.ts

---

## 7. Frontend — Client-Side Search Filter (Medium)

Add a search bar to filter posts in real time.

### Requirements
- Search input above posts list
- Filter client-side
- Optional debounce
- “No posts found” handling

### Files to Modify
- frontend/app/components/PostsList.tsx
or
- frontend/app/page.tsx

---

## 8. Full-Stack — Debug: Posts Not Displaying

One intentional bug exists.

### Possible Issues
- CORS configuration
- Wrong API URL
- Missing error handling
- Response shape mismatch

### Requirements
- Identify the issue
- Fix it
- Comment explanation
- Verify frontend displays posts

---

## 9. Backend — Global Logging Interceptor (Medium)

Log all incoming requests.

### Requirements
- Create interceptor:
  - backend/src/common/interceptors/logging.interceptor.ts
- Log:
  ```
  [TIMESTAMP] METHOD URL – STATUS_CODE – RESPONSE_TIME ms
  ```
- Register globally

### Files
- interceptor file
- main.ts or app.module.ts

---

## 10. Frontend — Dark Mode Toggle (Medium)

Add theme switching with persistence.

### Requirements
- Toggle button (layout.tsx)
- Tailwind dark mode
- Save preference in localStorage
- Apply class to html/body

### Files to Modify
- frontend/app/layout.tsx
- frontend/app/globals.css
- frontend/tailwind.config.js

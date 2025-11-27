# Full-Stack Assessment — NestJS + Next.js + React + TypeScript

This assessment contains backend, frontend, and UI tasks covering **NestJS**, **Next.js**, **React**, **Material‑UI**, and **TypeScript**.

---

# Tasks Overview

## 1. Backend — Pagination for GET /posts
Implement pagination using query parameters.

## 2. Frontend — PostForm Component
Create a reusable component for submitting new posts.

## 3. Frontend — Post Creation API Integration
Integrate the form and send new posts to the backend.

## 4. Backend — Search for GET /posts
Add search capabilities to the posts endpoint.

## 5. Frontend — PostsList Component
Build a component to fetch and display posts with proper UI states.

## 6. Backend — Update Post (PATCH /posts/:id)
Add a partial update endpoint for posts.

## 7. Frontend — Client-Side Search Filter
Implement client-side filtering for posts.

## 8. Full-Stack — Debugging: Posts Not Displaying
Identify and resolve an issue preventing posts from displaying.

## 9. Backend — Request Logging Interceptor
Create a global logging interceptor.

## 10. Frontend — Dark Mode Toggle
Implement a toggle for dark mode with persistence.

---

# React + TypeScript: Text + Image Uploader

## Overview
Build an interface allowing users to:
- Enter text.
- Upload images via drag-drop or file picker.
- Preview and remove attachments.
- Send messages to a scrollable list.
- Select items for deletion or export.
- Keep the input bar always visible.

---

## Functional Requirements

### 1. Text + Drag-Drop
- Text input accepts user text.
- Dragging images over the input area should trigger a warning state.
- Dropping files elsewhere in the app has no effect.

### 2. Attachment Button
- A button opens the image-only file picker.
- Selected files appear as deletable thumbnails.

### 3. Send
- Disabled unless there is text or attachments.
- Sending adds an item to the list and resets inputs.

### 4. Sent Items
- Display text and image previews.
- Items can be individually selected.
- Per-item actions: delete, export as JSON.
- Bulk actions: delete selected, export selected.

### 5. Layout & Styling
- Use MUI components and theme.
- Responsive design.

---

## Technical Specs
- **React** 18+
- **TypeScript**
- **Material‑UI**
- **State Management:** React hooks
- **File Handling:** URL.createObjectURL / revokeObjectURL

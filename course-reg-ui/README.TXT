Online Course Registration System - UI/UX Draft

Repository URL:
https://github.com/javadaminedjlali-code/course-reg-ui.git

Team Member Contributions:
- Leonard Okyere: Built Home Screen + shared CSS theme
- Javad Edjlali: Built Course Search Screen + search filtering logic + Built Student Registration Screen + validation rules
- Saleh Mohaidat: Built Instructor Schedule Screen + instructor login
- Youssef Shawquy: Built Session Enrollment Screen + authorization restriction

One-line Summary of Each Screen:
- Home (index.html): Central navigation hub to all core features.
- Course Search (course-search.html): Filters sessions by department/instructor/course number and shows course details.
- Student Registration (student-registration.html): Student login, view enrolled sessions, register/drop sessions with validation.
- Instructor Schedule (instructor-schedule.html): Instructor login and view assigned sessions.
- Session Enrollment (session-enrollment.html): Restricted page listing students enrolled in a selected session.

HTML/CSS/JS Elements or Techniques Used:
- HTML: semantic layout, tables, forms, nav
- CSS: shared stylesheet for consistent layout, colors, typography, spacing, custom buttons
- JS: localStorage as a demo datastore, filtering logic, login state, enrollment validation, role-based authorization

Design Challenges / Decisions:
- Chose a single shared top navigation and shared CSS to keep consistency across pages.
- Used localStorage to simulate database + authentication without needing a backend.
- Added validation to prevent duplicate registrations and enforce maximum enrollment.
- Restricted Session Enrollment page to instructors/admin only to demonstrate authorization.

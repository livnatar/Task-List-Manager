# Task Management App

This app allows you to manage tasks by adding, editing, deleting, and sorting them based on due time. It supports task categories, priorities, and due dates.

## Features

- **Priority & Category Options:** Choose task priority (Low, Medium, High) and category (Work, Personal, Shopping, Health, Other).
- **Task Management:** Add, edit, and delete tasks.
- **Sorting & Filtering:** Sort tasks by due time and filter by category.
- **Remaining Time:** Tasks show remaining time and update every minute.
- **Error Handling:** Form validation with error indicators.

## Setup

1. **DOM Initialization:** 
   - Initializes priority and category options.
   - Renders an empty list if no tasks are present.

2. **Task List Management:**
   - Tasks can be added, edited, or deleted.
   - Task list updates based on sorting or filtering actions.

## Modules
- **initDomModule:** Initializes priority and category options.
- **UiModule:** Handles task list rendering, form toggling, and error handling.


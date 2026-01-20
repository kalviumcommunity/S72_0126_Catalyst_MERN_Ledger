# Zod Validation Testing Guide

This document provides curl commands and example scripts to test the Zod validation layer.

## Prerequisites

Ensure you have:
1. Installed dependencies: `npm install`
2. Run Prisma migrations: `npx prisma migrate dev`
3. Seed the database: `npm run seed`
4. Started the server (if using Next.js): `npm run dev`

## Testing User Validation

### ✅ Valid User Creation
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@redcross.org",
    "name": "John Doe",
    "organization": "Red Cross",
    "role": "contributor"
  }'
```

### ❌ Invalid Email Format
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email",
    "name": "John Doe"
  }'
```
**Expected Error:**
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### ❌ Missing Name
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "name": ""
  }'
```

## Testing Project Validation

### ✅ Valid Public Project
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Clean Water Initiative 2026",
    "description": "Providing clean water access to 10,000 people",
    "isPublic": true,
    "status": "active",
    "ownerId": 1
  }'
```

### ❌ Title Too Short (< 5 chars)
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "NGO",
    "ownerId": 1
  }'
```
**Expected Error:**
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "field": "title",
      "message": "Project title must be at least 5 characters"
    }
  ]
}
```

### ❌ Invalid Date Range
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Water Project",
    "startDate": "2026-12-31T00:00:00Z",
    "endDate": "2026-01-01T00:00:00Z",
    "ownerId": 1
  }'
```
**Expected Error:**
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "field": "endDate",
      "message": "End date must be after start date"
    }
  ]
}
```

## Testing Task Validation (Critical for Reusability)

### ✅ Valid Task with Template URL
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Site Survey Template",
    "description": "Standardized water quality assessment checklist",
    "templateUrl": "https://docs.google.com/document/d/abc123",
    "status": "pending",
    "priority": "high",
    "projectId": 1
  }'
```

### ❌ Invalid Template URL (MOST IMPORTANT TEST)
This test ensures the key reusability feature works correctly:

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Site Survey Template",
    "templateUrl": "not-a-url",
    "projectId": 1
  }'
```
**Expected Error:**
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "field": "templateUrl",
      "message": "Template URL must be a valid URL format"
    }
  ]
}
```

### ❌ Invalid Status Enum
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Task Example",
    "status": "invalid-status",
    "projectId": 1
  }'
```

### ✅ Task without Template URL (Optional)
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Internal Planning Task",
    "description": "Not meant to be shared",
    "status": "in-progress",
    "projectId": 1,
    "assigneeId": 2
  }'
```

## Update Operations

### ✅ Update Task Template URL
```bash
curl -X PUT http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "id": 5,
    "templateUrl": "https://github.com/ngo-templates/site-survey/v2"
  }'
```

### ❌ Update with Invalid URL
```bash
curl -X PUT http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "id": 5,
    "templateUrl": "invalid-url-format"
  }'
```

## Query Operations (No Validation Required)

### Get All Public Projects
```bash
curl http://localhost:3000/api/projects?isPublic=true
```

### Get Tasks with Templates
```bash
curl http://localhost:3000/api/tasks?hasTemplate=true
```

### Get Tasks by Status
```bash
curl http://localhost:3000/api/tasks?status=pending
```

## Postman Collection

If you prefer Postman, import this collection structure:

```json
{
  "info": {
    "name": "NGO Ledger - Zod Validation Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Users",
      "item": [
        {
          "name": "Create Valid User",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "url": "http://localhost:3000/api/users",
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"test@ngo.org\",\"name\":\"Test User\"}"
            }
          }
        },
        {
          "name": "Create Invalid User (Bad Email)",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "url": "http://localhost:3000/api/users",
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"not-email\",\"name\":\"Test\"}"
            }
          }
        }
      ]
    },
    {
      "name": "Tasks",
      "item": [
        {
          "name": "Create Task with Invalid URL",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "url": "http://localhost:3000/api/tasks",
            "body": {
              "mode": "raw",
              "raw": "{\"title\":\"Test Task\",\"templateUrl\":\"bad-url\",\"projectId\":1}"
            }
          }
        }
      ]
    }
  ]
}
```

## Testing with Node.js Script

Create a test script (`test-validation.ts`):

```typescript
import { userSchema, projectSchema, taskSchema } from './src/lib/schemas';

console.log('Testing User Validation');
console.log('======================');

// Valid user
const validUser = userSchema.safeParse({
  email: 'test@example.com',
  name: 'Test User',
});
console.log('✅ Valid user:', validUser.success);

// Invalid user
const invalidUser = userSchema.safeParse({
  email: 'not-an-email',
  name: 'Test',
});
console.log('❌ Invalid user:', invalidUser.success);
if (!invalidUser.success) {
  console.log('Errors:', invalidUser.error.errors);
}

console.log('\nTesting Task Validation');
console.log('=======================');

// Valid task with URL
const validTask = taskSchema.safeParse({
  title: 'Test Task',
  templateUrl: 'https://example.com/template',
  projectId: 1,
});
console.log('✅ Valid task with URL:', validTask.success);

// Invalid task (bad URL)
const invalidTask = taskSchema.safeParse({
  title: 'Test Task',
  templateUrl: 'not-a-url',
  projectId: 1,
});
console.log('❌ Invalid task (bad URL):', invalidTask.success);
if (!invalidTask.success) {
  console.log('Errors:', invalidTask.error.errors);
}

console.log('\nTesting Project Validation');
console.log('=========================');

// Project with short title
const invalidProject = projectSchema.safeParse({
  title: 'NGO',
  ownerId: 1,
});
console.log('❌ Project with short title:', invalidProject.success);
if (!invalidProject.success) {
  console.log('Errors:', invalidProject.error.errors);
}
```

Run with: `ts-node test-validation.ts`

## Key Validation Features Demonstrated

1. **Email Format Validation** - Prevents invalid email addresses
2. **Minimum Length Validation** - Ensures meaningful project titles (5+ chars)
3. **URL Format Validation** - **CRITICAL**: Validates templateUrl for reusability
4. **Enum Validation** - Ensures status and priority values are from allowed sets
5. **Number Validation** - Ensures IDs are positive integers
6. **Custom Refinements** - Date range validation (endDate > startDate)
7. **Optional Fields** - Allows missing but validates if present
8. **Consistent Error Format** - All errors follow same structure

## Expected Behavior Summary

| Scenario | Expected Status | Error Field |
|----------|----------------|-------------|
| Valid user | 201 Created | - |
| Invalid email | 400 Bad Request | email |
| Short project title | 400 Bad Request | title |
| Invalid templateUrl | 400 Bad Request | templateUrl |
| Invalid status enum | 400 Bad Request | status |
| Date range error | 400 Bad Request | endDate |
| Valid task without URL | 201 Created | - |

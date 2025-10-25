# JWT Authentication Guide for Postman Testing

## 🔐 Authentication Required

**ALL endpoints except `/api/auth/**` require JWT authentication.**

Based on your `SecurityConfig.java`:
```java
.requestMatchers("/api/auth/**").permitAll()  // ✅ Public
.anyRequest().authenticated()                 // 🔒 Requires JWT
```

---

## 🚀 Quick Start with Updated Collection

### File to Import:
**`Family_Member_Allergy_API_WITH_AUTH.postman_collection.json`**

This collection includes:
- ✅ JWT Bearer Token authentication
- ✅ Automatic token storage
- ✅ Login endpoint that saves token
- ✅ All requests pre-configured with auth

---

## 📝 Step-by-Step Testing

### Step 1: Login and Get Token

**Option A: Use Existing User**
```
POST {{baseUrl}}/api/auth/login

Body:
{
  "username": "your_username",
  "password": "your_password"
}
```

**Option B: Register New User**
1. Register:
```
POST {{baseUrl}}/api/auth/register

Body:
{
  "username": "testuser",
  "email": "testuser@example.com",
  "password": "Test123!@#",
  "fullName": "Test User"
}
```

2. Verify Email (if required):
```
POST {{baseUrl}}/api/auth/verify-email

Body:
{
  "email": "testuser@example.com",
  "otp": "123456"
}
```

3. Login:
```
POST {{baseUrl}}/api/auth/login

Body:
{
  "username": "testuser",
  "password": "Test123!@#"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": 1,
  "username": "testuser",
  "email": "testuser@example.com",
  "role": "USER"
}
```

**✅ Token is automatically saved to `jwt_token` variable!**

---

### Step 2: Token is Applied Automatically

After login, all subsequent requests automatically include:
```
Authorization: Bearer {{jwt_token}}
```

You don't need to do anything - it's automatic! 🎉

---

### Step 3: Test Protected Endpoints

Now you can run any request:
```
GET {{baseUrl}}/api/allergies
GET {{baseUrl}}/api/family-members
POST {{baseUrl}}/api/family-members
... etc
```

All will work because the JWT token is included automatically.

---

## 🔧 Manual Setup (If Not Using Collection)

### Method 1: Collection-Level Auth (Recommended)

1. Right-click collection → **Edit**
2. Go to **Authorization** tab
3. Type: **Bearer Token**
4. Token: `{{jwt_token}}`
5. Save

Now ALL requests inherit this authentication! ✅

### Method 2: Individual Request Auth

For each request:
1. Go to **Authorization** tab
2. Type: **Bearer Token**
3. Token: `{{jwt_token}}`

---

## 🎯 Environment Variables Setup

### Create Environment (Optional but Recommended)

1. Click Environment icon (top right)
2. Create new environment: "Family Kitchen Hub - Local"
3. Add variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `baseUrl` | `http://localhost:8080` | |
| `jwt_token` | | (auto-filled after login) |
| `user_id` | | (auto-filled after login) |
| `allergy_peanuts_id` | | (auto-filled) |
| `allergy_dairy_id` | | (auto-filled) |
| `family_member_id` | | (auto-filled) |

4. Select this environment before testing

---

## 🧪 Testing Workflow

### Complete Test Sequence:

1. **Login** (Folder "0. Authentication")
   - Run "Login and Get JWT Token"
   - ✅ Token saved automatically
   - ✅ User ID saved automatically

2. **Create Allergies** (Folder "1. Allergies")
   - Run all Create Allergy requests
   - ✅ IDs saved automatically

3. **Create Family Members** (Folder "2. Family Members")
   - Run Create requests
   - ✅ Uses saved allergy IDs
   - ✅ Saves family member IDs

4. **Test Operations** (Folders 2 & 3)
   - Update, delete, search
   - All authenticated automatically

---

## 📋 Login Response Reference

### Successful Login (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImlhdCI6MTYxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  "id": 1,
  "username": "testuser",
  "email": "testuser@example.com",
  "fullName": "Test User",
  "role": "USER"
}
```

### Failed Login (401 Unauthorized):
```json
{
  "timestamp": "2024-01-01T12:00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid username or password"
}
```

---

## 🔍 Verify Token is Working

### Test with Protected Endpoint

**Without Token:**
```
GET {{baseUrl}}/api/allergies
(No Authorization header)

Response: 401 Unauthorized
```

**With Token:**
```
GET {{baseUrl}}/api/allergies
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response: 200 OK
[
  {"id": 1, "name": "Peanuts"},
  ...
]
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "401 Unauthorized" on Protected Endpoints

**Cause:** No JWT token or expired token

**Solution:**
1. Run the "Login and Get JWT Token" request
2. Verify token is saved: Check environment variables (eye icon 👁️)
3. Make sure collection/request has Bearer auth configured

---

### Issue 2: Token Variable Shows `{{jwt_token}}`

**Cause:** Variable not populated

**Solution:**
1. Run login request first
2. Check the "Test Results" tab - should show "JWT token received"
3. Check Console (bottom left) for errors

---

### Issue 3: "Token Expired"

**Cause:** JWT token has expiration time

**Solution:**
1. Simply login again
2. New token will be saved automatically
3. Continue testing

---

### Issue 4: "Email not verified"

**Cause:** User account requires email verification

**Solution:**
1. Check your email for OTP
2. Run "Verify Email (OTP)" request
3. Then login

---

## 💡 Pro Tips

### Tip 1: Use Collection Runner with Auth
- Login is included in folder "0. Authentication"
- Run entire collection from start
- Token gets set and used automatically

### Tip 2: View Token in Console
After login, check Console:
```
✅ JWT Token saved: eyJhbGciOiJIUzI1NiIs...
```

### Tip 3: Check Token Expiry
Most JWT tokens expire after some time (often 1-24 hours). If you get 401 errors suddenly, just login again.

### Tip 4: Save Multiple Users
Create different environments for different users:
- "Family Kitchen - User 1"
- "Family Kitchen - Admin"
Each with their own tokens

---

## 🔐 Security Notes

### Do NOT:
- ❌ Share your JWT tokens
- ❌ Commit tokens to git
- ❌ Store tokens in "Initial Value" (use "Current Value" only)

### DO:
- ✅ Login for each testing session
- ✅ Use environment variables for tokens
- ✅ Clear tokens when done testing

---

## 📊 Quick Reference

### Authentication Endpoints (Public - No Token Needed)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/verify-email` | POST | Verify email with OTP |
| `/api/auth/login` | POST | Get JWT token |
| `/api/auth/forgot-password` | POST | Request reset token |
| `/api/auth/reset-password` | POST | Reset password |

### All Other Endpoints (Protected - Token Required)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/allergies/**` | ALL | Allergy operations |
| `/api/family-members/**` | ALL | Family member operations |
| `/api/member-allergies/**` | ALL | Association operations |
| `/api/recipes/**` | ALL | Recipe operations |
| `/api/ingredients/**` | ALL | Ingredient operations |

---

## 🎉 You're Ready!

1. ✅ Import `Family_Member_Allergy_API_WITH_AUTH.postman_collection.json`
2. ✅ Run "Login and Get JWT Token"
3. ✅ Token is saved automatically
4. ✅ All subsequent requests work with authentication
5. ✅ Start testing!

**Happy Testing with JWT! 🚀**

For more details, see `AUTH_API_DOCUMENTATION.md` for complete authentication API reference.


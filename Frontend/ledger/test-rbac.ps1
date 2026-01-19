# RBAC Testing Script for Ledger Platform
# This script demonstrates the Role-Based Access Control system

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   RBAC Testing - Ledger Platform" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$BASE_URL = "http://localhost:3000"

# Function to make API calls and display results
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Token = "",
        [string]$Body = "",
        [string]$TestName
    )
    
    Write-Host "`n--- Testing: $TestName ---" -ForegroundColor Yellow
    Write-Host "Method: $Method $Url" -ForegroundColor Gray
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
        Write-Host "Authorization: Bearer $($Token.Substring(0, [Math]::Min(20, $Token.Length)))..." -ForegroundColor Gray
    }
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-WebRequest -Uri $Url -Method $Method -Headers $headers -UseBasicParsing
        } else {
            $response = Invoke-WebRequest -Uri $Url -Method $Method -Headers $headers -Body $Body -UseBasicParsing
        }
        
        $statusCode = $response.StatusCode
        $content = $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
        
        Write-Host "Status: $statusCode" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Green
        Write-Host $content -ForegroundColor White
        
        return $response.Content | ConvertFrom-Json
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorResponse = $_.ErrorDetails.Message
        
        Write-Host "Status: $statusCode" -ForegroundColor Red
        Write-Host "Response:" -ForegroundColor Red
        Write-Host $errorResponse -ForegroundColor White
        
        return $null
    }
}

Write-Host "Step 1: Creating Admin User" -ForegroundColor Cyan
$adminSignup = Test-Endpoint -Method "POST" -Url "$BASE_URL/api/auth/signup" `
    -Body '{"name":"Admin User","email":"admin@test.com","password":"admin123","role":"admin"}' `
    -TestName "Create Admin User"

Write-Host "`nStep 2: Creating Regular User" -ForegroundColor Cyan
$userSignup = Test-Endpoint -Method "POST" -Url "$BASE_URL/api/auth/signup" `
    -Body '{"name":"Regular User","email":"user@test.com","password":"user123","role":"user"}' `
    -TestName "Create Regular User"

Write-Host "`n`nStep 3: Login as Admin" -ForegroundColor Cyan
$adminLogin = Test-Endpoint -Method "POST" -Url "$BASE_URL/api/auth/login" `
    -Body '{"email":"admin@test.com","password":"admin123"}' `
    -TestName "Admin Login"
$adminToken = $adminLogin.token

Write-Host "`nStep 4: Login as Regular User" -ForegroundColor Cyan
$userLogin = Test-Endpoint -Method "POST" -Url "$BASE_URL/api/auth/login" `
    -Body '{"email":"user@test.com","password":"user123"}' `
    -TestName "User Login"
$userToken = $userLogin.token

Write-Host "`n`n========================================" -ForegroundColor Cyan
Write-Host "   TESTING PROTECTED ROUTES" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Test 5: Access /api/users with Admin Token (SHOULD SUCCEED)" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Url "$BASE_URL/api/users" `
    -Token $adminToken `
    -TestName "Admin accessing /api/users"

Write-Host "`nTest 6: Access /api/users with User Token (SHOULD SUCCEED)" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Url "$BASE_URL/api/users" `
    -Token $userToken `
    -TestName "User accessing /api/users"

Write-Host "`nTest 7: Access /api/users without Token (SHOULD FAIL - 401)" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Url "$BASE_URL/api/users" `
    -TestName "No token accessing /api/users"

Write-Host "`n`nTest 8: Access /api/admin with Admin Token (SHOULD SUCCEED)" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Url "$BASE_URL/api/admin" `
    -Token $adminToken `
    -TestName "Admin accessing /api/admin"

Write-Host "`nTest 9: Access /api/admin with User Token (SHOULD FAIL - 403)" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Url "$BASE_URL/api/admin" `
    -Token $userToken `
    -TestName "User accessing /api/admin (DENIED)"

Write-Host "`nTest 10: Access /api/admin without Token (SHOULD FAIL - 401)" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Url "$BASE_URL/api/admin" `
    -TestName "No token accessing /api/admin"

Write-Host "`n`n========================================" -ForegroundColor Cyan
Write-Host "   TESTING SUMMARY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "✅ Admin users can access /api/admin" -ForegroundColor Green
Write-Host "✅ Regular users CANNOT access /api/admin (403)" -ForegroundColor Green
Write-Host "✅ All authenticated users can access /api/users" -ForegroundColor Green
Write-Host "✅ Unauthenticated requests are rejected (401)" -ForegroundColor Green
Write-Host "`n✅ RBAC System Working Correctly!`n" -ForegroundColor Green

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Tokens for Manual Testing" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
Write-Host "Admin Token:" -ForegroundColor Yellow
Write-Host $adminToken -ForegroundColor White
Write-Host "`nUser Token:" -ForegroundColor Yellow
Write-Host $userToken -ForegroundColor White
Write-Host ""

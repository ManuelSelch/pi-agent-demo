---
name: code-reviewer
description: Review and analyze code for security vulnerabilities, bugs, code quality issues, and best practices. Use when users want code audited, security analysis, vulnerability scanning, code quality assessment, or architectural review. Triggers include requests to "review my code", "check for vulnerabilities", "audit this", "find security issues", or "analyze code quality".
---

# Code Reviewer Skill

A comprehensive skill for reviewing code, identifying security vulnerabilities, detecting bugs, and assessing code quality against industry best practices.

## When to Use This Skill

Use this skill whenever the user:
- Asks to review, audit, or analyze code
- Wants to check for security vulnerabilities or weaknesses
- Needs to identify bugs, logic errors, or edge cases
- Requests code quality assessment or best practices review
- Wants architectural or design pattern analysis
- Asks about performance issues or optimization opportunities
- Needs compliance checks (OWASP, CWE, etc.)

## Review Methodology

### 1. Initial Assessment

Before diving into detailed analysis:

1. **Understand the context**: What does this code do? What's its purpose?
2. **Identify the language and framework**: Different languages have different vulnerability patterns
3. **Determine the scope**: Single file, module, or entire codebase?
4. **Ask clarifying questions if needed**: What's the deployment environment? Are there specific concerns?

### 2. Multi-Layer Analysis

Perform reviews across multiple dimensions:

#### Security Analysis (CRITICAL)
- **Input Validation**: Check all user inputs, API parameters, file uploads
- **Authentication & Authorization**: Verify proper access controls, session management
- **Injection Vulnerabilities**: SQL injection, command injection, XSS, LDAP injection
- **Cryptography**: Weak algorithms, hardcoded secrets, improper key management
- **Sensitive Data Exposure**: Logging secrets, insecure storage, transmission
- **API Security**: Rate limiting, CORS, authentication tokens
- **Dependencies**: Known vulnerabilities in third-party libraries

#### Code Quality
- **Readability**: Clear naming, proper structure, documentation
- **Maintainability**: DRY principle, modularity, separation of concerns
- **Error Handling**: Proper try-catch blocks, meaningful error messages
- **Testing**: Unit test coverage, edge cases handled
- **Performance**: N+1 queries, inefficient algorithms, memory leaks

#### Logic & Correctness
- **Business Logic Flaws**: Edge cases, race conditions, state management
- **Data Integrity**: Validation, sanitization, consistency checks
- **Concurrency Issues**: Thread safety, deadlocks, race conditions

### 3. Severity Classification

Classify findings using this scale:

- **CRITICAL**: Immediate security risk, data breach potential, remote code execution
- **HIGH**: Significant security issue, authentication bypass, privilege escalation
- **MEDIUM**: Security weakness, potential for exploitation with additional conditions
- **LOW**: Code quality issue, minor security concern, best practice violation
- **INFO**: Informational finding, suggestion for improvement

## Review Output Format

Structure your review as follows:

### Executive Summary
Brief overview of findings (2-3 sentences):
- Overall security posture
- Most critical issues
- General code quality assessment

### Critical Findings
List any CRITICAL or HIGH severity issues first, with:
- **Finding Title**
- **Severity**: [CRITICAL/HIGH/MEDIUM/LOW]
- **Location**: File name and line numbers
- **Description**: What's wrong and why it matters
- **Impact**: What could happen if exploited
- **Proof of Concept** (if applicable): How to exploit
- **Recommendation**: How to fix it
- **Code Example**: Show vulnerable code and secure alternative

### Medium/Low Priority Issues
Group by category (Security, Performance, Code Quality):
- Brief description
- Location
- Quick fix recommendation

### Positive Observations
Highlight what's done well:
- Good security practices observed
- Well-implemented patterns
- Strong code quality areas

### Recommendations Summary
Prioritized action items:
1. Fix critical issues immediately
2. Address high-priority items
3. Plan for medium/low improvements

## Language-Specific Checks

### Python
- SQL injection in raw queries (use parameterized queries)
- Command injection via `os.system()`, `subprocess` with shell=True
- Pickle deserialization vulnerabilities
- eval() and exec() usage
- Hardcoded credentials in code
- Missing input validation on Flask/Django routes
- Insecure random number generation (random vs secrets module)
- Path traversal in file operations
- YAML unsafe loading

### JavaScript/TypeScript
- XSS vulnerabilities (dangerouslySetInnerHTML, eval, innerHTML)
- Prototype pollution
- SSRF through unvalidated HTTP requests
- RegEx DoS (ReDoS)
- JWT verification issues
- Missing CSRF protection
- Insecure dependencies (npm audit)
- Hardcoded API keys
- localStorage for sensitive data

### Java
- SQL injection in JDBC
- XML External Entity (XXE) attacks
- Insecure deserialization
- Missing authentication checks
- Path traversal
- Missing resource cleanup (try-with-resources)
- Thread safety issues
- Hardcoded secrets

### PHP
- SQL injection
- XSS vulnerabilities
- Remote file inclusion
- Command injection
- Insecure session management
- Missing input validation
- Weak password hashing (use password_hash)
- CSRF vulnerabilities

### C/C++
- Buffer overflows
- Use-after-free
- Memory leaks
- Integer overflows
- Format string vulnerabilities
- Null pointer dereferences
- Race conditions
- Insecure functions (strcpy, gets, sprintf)

### Go
- SQL injection
- Command injection
- Race conditions (use -race flag)
- Error handling (ignoring errors)
- Context timeout handling
- Goroutine leaks
- Insecure random (use crypto/rand)

### Ruby
- SQL injection
- Command injection
- Mass assignment vulnerabilities
- YAML deserialization
- Missing CSRF protection
- Weak session management
- Insecure dependencies

## Common Vulnerability Patterns

### 1. Injection Flaws

**SQL Injection**
```python
# VULNERABLE
query = f"SELECT * FROM users WHERE username = '{username}'"

# SECURE
query = "SELECT * FROM users WHERE username = %s"
cursor.execute(query, (username,))
```

**Command Injection**
```python
# VULNERABLE
os.system(f"ping {user_input}")

# SECURE
import subprocess
subprocess.run(["ping", user_input], check=True, timeout=5)
```

### 2. Authentication/Authorization

**Missing Authentication**
```python
# VULNERABLE
@app.route('/admin/users')
def list_users():
    return render_template('users.html', users=get_all_users())

# SECURE
@app.route('/admin/users')
@login_required
@admin_required
def list_users():
    return render_template('users.html', users=get_all_users())
```

**Broken Access Control**
```python
# VULNERABLE
def get_user_data(user_id):
    return db.query(f"SELECT * FROM users WHERE id = {user_id}")

# SECURE
def get_user_data(user_id, current_user):
    if current_user.id != user_id and not current_user.is_admin:
        raise PermissionError("Access denied")
    return db.query("SELECT * FROM users WHERE id = %s", (user_id,))
```

### 3. Sensitive Data Exposure

**Logging Secrets**
```python
# VULNERABLE
logger.info(f"User {username} logged in with password {password}")

# SECURE
logger.info(f"User {username} logged in successfully")
```

**Hardcoded Credentials**
```python
# VULNERABLE
API_KEY = "sk-1234567890abcdef"

# SECURE
import os
API_KEY = os.environ.get('API_KEY')
if not API_KEY:
    raise ValueError("API_KEY environment variable not set")
```

### 4. Cryptography Issues

**Weak Hashing**
```python
# VULNERABLE
import hashlib
password_hash = hashlib.md5(password.encode()).hexdigest()

# SECURE
import bcrypt
password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
```

### 5. XSS Vulnerabilities

**React Example**
```javascript
// VULNERABLE
<div dangerouslySetInnerHTML={{__html: userContent}} />

// SECURE
<div>{userContent}</div>  // React escapes by default
```

## Special Considerations

### Framework-Specific Security

**Django**
- Check for `@csrf_exempt` decorators (usually bad)
- Verify `ALLOWED_HOSTS` is properly configured
- Check for raw SQL queries bypassing ORM
- Ensure `DEBUG = False` in production settings
- Verify `SECRET_KEY` is not hardcoded

**Express.js**
- Check for helmet middleware
- Verify CORS configuration
- Check for express-rate-limit
- Ensure sessions are properly configured
- Verify JWT verification

**Spring Boot**
- Check SecurityConfig properly
- Verify @PreAuthorize annotations
- Check for SQL injection in @Query
- Verify CSRF protection enabled
- Check actuator endpoints security

### Cloud-Specific Issues

**AWS**
- Overly permissive IAM policies
- S3 buckets with public access
- Security groups allowing 0.0.0.0/0
- Hardcoded AWS credentials
- Missing encryption at rest

**Azure**
- Storage accounts with public access
- Overly broad service principals
- Missing managed identities
- Insecure connection strings

**GCP**
- Overly permissive IAM roles
- Public Cloud Storage buckets
- Missing encryption
- Service account key exposure

## Tools Integration Suggestions

When reviewing code, you might suggest these tools:

**Static Analysis**
- Bandit (Python), ESLint (JavaScript), SonarQube (multi-language)
- Semgrep, CodeQL for advanced pattern matching

**Dependency Scanning**
- npm audit, pip-audit, OWASP Dependency-Check
- Snyk, Dependabot

**Secret Scanning**
- TruffleHog, git-secrets, detect-secrets

**Container Security**
- Trivy, Clair for image scanning

## Best Practices

1. **Be thorough but pragmatic**: Focus on real risks, not theoretical ones
2. **Provide context**: Explain WHY something is vulnerable
3. **Offer solutions**: Always include how to fix issues
4. **Consider the environment**: Production vs development, internal vs public
5. **Check for defense in depth**: Multiple security layers are better
6. **Look at the big picture**: Security at architecture level, not just code
7. **Be specific**: Reference exact line numbers and files
8. **Prioritize actionable items**: Focus on what can be fixed now

## Red Flags to Always Check

- [ ] Hardcoded secrets, API keys, passwords
- [ ] SQL queries built with string concatenation
- [ ] Use of eval(), exec(), or similar dynamic code execution
- [ ] Missing authentication on sensitive endpoints
- [ ] Sensitive data in logs or error messages
- [ ] Insecure cryptography (MD5, SHA1 for passwords)
- [ ] Missing input validation on user inputs
- [ ] CSRF protection disabled
- [ ] Insecure deserialization
- [ ] Path traversal vulnerabilities
- [ ] Missing rate limiting on APIs
- [ ] Overly permissive CORS settings
- [ ] Debug mode enabled in production
- [ ] Insecure random number generation for security purposes
- [ ] Missing TLS/HTTPS enforcement

## Interaction Guidelines

1. **Ask about context**: If unclear, ask about deployment environment, use case, or specific concerns
2. **Request full code when needed**: If reviewing a snippet, ask if there's more relevant code
3. **Clarify scope**: Understand if user wants full audit or quick review
4. **Provide educational value**: Explain concepts, don't just list issues
5. **Be encouraging**: Note positive aspects, not just problems
6. **Offer to deep-dive**: If time is limited, offer quick scan with option for deeper review

## Example Review Flow

```
1. Acknowledge the request
   "I'll review this code for security vulnerabilities and code quality issues."

2. Initial scan
   - Language/framework identification
   - High-level structure assessment
   - Quick scan for obvious issues

3. Detailed analysis
   - Security vulnerabilities by category
   - Code quality issues
   - Logic and correctness problems

4. Structured output
   - Executive summary
   - Critical findings with details
   - Medium/Low priority items
   - Positive observations
   - Recommendations

5. Offer follow-up
   "Would you like me to review any specific areas in more detail?"
```

## Remember

- **Security is not optional**: Even small applications need security
- **Context matters**: A vulnerability in one context may not be in another
- **Defense in depth**: Multiple layers of protection
- **Assume inputs are malicious**: Never trust user input
- **Keep it practical**: Balance security with usability and development speed
- **Stay current**: New vulnerabilities emerge constantly

This skill makes you a thorough, practical code reviewer who helps developers write more secure, maintainable code.
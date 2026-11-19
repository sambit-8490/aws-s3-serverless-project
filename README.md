# Student Management System — AWS Serverless

A beginner-friendly student management application built with a static frontend hosted on Amazon S3 and a serverless backend using Amazon API Gateway, AWS Lambda, and Amazon DynamoDB.

## Project overview

The frontend allows a user to:
- Add a student with an ID, name, course, and city.
- View the saved student records.

### Architecture

```text
User's browser
     |
     v
Static website on Amazon S3
     |
     | HTTPS requests (GET and POST)
     v
Amazon API Gateway — REST API (StudentAPI)
     |
     v
AWS Lambda — StudentFunction
     |
     v
Amazon DynamoDB — student table
```

## AWS resources used

| Service | Project use |
|---|---|
| Amazon S3 | Hosts the HTML, CSS, and JavaScript frontend |
| Amazon API Gateway | Exposes the `/students-resource` API resource |
| AWS Lambda | Processes GET and POST requests |
| Amazon DynamoDB | Stores student records |

## Current project configuration

- AWS Region: `us-east-1`
- API name: `StudentAPI`
- API ID: `jkxiiaup3b`
- Stage: `dev`
- API base URL: `https://jkxiiaup3b.execute-api.us-east-1.amazonaws.com/dev`
- Resource path: `/students-resource`
- Full endpoint: `https://jkxiiaup3b.execute-api.us-east-1.amazonaws.com/dev/students-resource`
- Lambda function: `StudentFunction`
- S3 website bucket: `student-management-website-2026-serverless-deploy`

> Keep the API endpoint and AWS resource names in sync with the values in your own AWS account. Do not publish AWS credentials, access keys, or other secrets.

## API endpoints

| Method | URL | Purpose |
|---|---|---|
| GET | `/students-resource` | Returns all student records |
| POST | `/students-resource` | Adds a student record |
| OPTIONS | `/students-resource` | Supports browser CORS preflight |

### POST request example

```json
{
  "studentId": "101",
  "name": "Rahul",
  "course": "AWS",
  "city": "Kolkata"
}
```

Successful response (example):

```json
{
  "message": "Student added successfully",
  "student": {
    "studentId": "101",
    "name": "Rahul",
    "course": "AWS",
    "city": "Kolkata"
  }
}
```

Expected success status: `201 Created`.

### GET response example

```json
[
  {
    "studentId": "101",
    "name": "Rahul",
    "course": "AWS",
    "city": "Kolkata"
  }
]
```

If the table has no records, the endpoint may return an empty array: `[]`.

## Student data model

Each DynamoDB item uses these attributes:

| Attribute | Example | Meaning |
|---|---|---|
| `studentId` | `101` | Student identifier (stored as a string) |
| `name` | `Rahul` | Student name |
| `course` | `AWS` | Course name |
| `city` | `Kolkata` | Student city |

The DynamoDB table's partition key must match the key used by the application (`studentId`). The Lambda function reads the table name from the `TABLE_NAME` environment variable.

## Frontend files

Typical frontend files:
- `index.html` — student form and records table.
- `style.css` — page styling.
- `script.js` — sends API requests and renders records.

The JavaScript API URL should be:

```javascript
const API_URL =
  "https://jkxiiaup3b.execute-api.us-east-1.amazonaws.com/dev";
```

The form sends POST requests to `API_URL + "/students-resource"`. The records view sends GET requests to the same endpoint.

## CORS configuration

Because the website and API have different origins, the API must return appropriate CORS headers.

For this learning project, the Lambda response includes:

```python
'headers': {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
}
```

API Gateway CORS settings should allow:
- Methods: `GET`, `POST`, `OPTIONS`
- Headers: `Content-Type`
- Origin: `*`
- Gateway responses: Default 4XX and Default 5XX

After changing API Gateway settings, deploy the API to the `dev` stage. The Lambda function must also be deployed after code changes.

For a production application, replace `*` with the exact website origin and review authentication and authorization requirements.

## Deploy / update checklist

1. Upload the frontend files to the S3 bucket.
2. Confirm static website hosting and the bucket's website access configuration.
3. Confirm the DynamoDB table exists and its partition key is `studentId`.
4. Confirm Lambda has the `TABLE_NAME` environment variable.
5. Confirm Lambda's execution role can access the DynamoDB table.
6. Confirm API Gateway GET and POST methods use Lambda proxy integration with `StudentFunction`.
7. Confirm CORS is configured in API Gateway and in Lambda responses.
8. Deploy Lambda code.
9. Deploy the API Gateway REST API to stage `dev`.
10. Test GET, then POST, then refresh the frontend.

## Quick verification

Open this endpoint in a browser:

`https://jkxiiaup3b.execute-api.us-east-1.amazonaws.com/dev/students-resource`

A successful GET normally returns `200 OK` and a JSON array. An empty table returns `[]`.

To test adding a record, use the website form with sample values such as:
- Student ID: `101`
- Name: `Rahul`
- Course: `AWS`
- City: `Kolkata`

After submitting, verify that the POST request returns `201 Created`, then reload the GET endpoint and confirm the record appears.

## Troubleshooting

| Symptom | What to check |
|---|---|
| Browser shows `NetworkError` | Inspect Fetch/XHR requests; check CORS headers on Lambda responses and API Gateway CORS configuration |
| GET returns 403 or 404 | Check API URL, stage (`dev`), resource path, and deployment |
| POST returns 400 | Confirm all four fields are supplied and JSON property names match |
| POST returns 500 | Check Lambda logs, `TABLE_NAME`, DynamoDB table name, and Lambda IAM permissions |
| POST returns 201 but list does not update | Check GET request and DynamoDB table/partition key |
| S3 website shows 403 for `favicon.ico` | This is a separate missing/restricted favicon issue; it does not alone prove the API is failing |

## Security and cost notes

- Do not put AWS access keys in frontend JavaScript.
- Use least-privilege IAM permissions for Lambda.
- Restrict CORS to the website origin before production use.
- Add authentication and validation before exposing real student data.
- Review AWS pricing and remove unused resources when the project is no longer needed.


## Recommended project folder structure

Keep the website source code, Lambda backend, and deployment notes separate:

```text
student-management-system/
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── assets/
│       └── favicon.ico
├── backend/
│   └── student-function/
│       ├── lambda_function.py
│       └── requirements.txt
├── docs/
│   ├── architecture.md
│   └── setup-notes.md
└── README.md
```

For this project, `requirements.txt` can be empty if you only use the Python standard library and the AWS SDK already provided in the Lambda Python runtime. Do not put AWS credentials in this folder. The DynamoDB table and API Gateway are AWS resources, not local folders.

### AWS service architecture diagram

```text
                    STUDENT / ADMIN
                          |
                          | Opens website
                          v
              Amazon S3 Static Website
              (index.html, style.css,
                    script.js)
                          |
                          | HTTPS
                          | GET /students-resource
                          | POST /students-resource
                          v
                 Amazon API Gateway
                    StudentAPI
                  Stage: dev
                          |
                          | Lambda proxy integration
                          v
                 AWS Lambda Function
                  StudentFunction
                - Validate input
                - Process GET / POST
                - Add CORS response headers
                          |
                          | boto3
                          v
                  Amazon DynamoDB
                 Student table
              Partition key: studentId
```

### Request flows

**Create a student (POST):** Browser form → API Gateway → Lambda → DynamoDB `PutItem` → Lambda returns HTTP `201` → browser refreshes records using GET.

**List students (GET):** Browser → API Gateway → Lambda → DynamoDB `Scan` → Lambda returns JSON array → browser renders table.

**Browser CORS preflight (OPTIONS):** Browser may send OPTIONS before a cross-origin request. API Gateway's CORS/OPTIONS configuration and the Lambda response headers must allow the website origin, requested method, and `Content-Type` header.

### Where each piece lives

| Component | Location |
|---|---|
| HTML/CSS/JavaScript source | `frontend/` on your computer |
| Published website files | S3 bucket `student-management-website-2026-serverless-deploy` |
| Python handler source | `backend/student-function/lambda_function.py` |
| Running backend | AWS Lambda `StudentFunction` |
| API routes | API Gateway `StudentAPI`, resource `/students-resource` |
| Student records | DynamoDB table named by Lambda environment variable `TABLE_NAME` |
| Notes and diagrams | `docs/` |

The folder structure is a recommended local source-code layout; AWS Console resources are deployed separately and are not automatically created just by making these folders.

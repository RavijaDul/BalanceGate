# BalanceGate

**Secure Serverless Wallet Platform**

BalanceGate is a full-stack, serverless wallet application that allows authenticated users to create and manage wallets, view balances, and perform secure credit/debit transactions.
It is built using AWS serverless services and a modern Next.js frontend, following real-world security and scalability best practices.

**Live Demo**: https://balance-gate.vercel.app
**Backend API**: AWS API Gateway + Lambda

---

## Features

### Authentication & Security

- User authentication via AWS Cognito (OIDC / JWT)
- API protection using JWT + API Gateway API Keys
- Ownership enforcement (users can only access their own wallets)
- CORS-safe, production-ready API configuration

### Wallet Management

- Create multiple wallets per user
- Assign wallet names and currencies
- View all wallets owned by the logged-in user
- Fetch individual wallet details securely

### Transactions

- Credit and debit wallet balances
- Atomic balance updates using DynamoDB conditional expressions
- Prevents negative balances
- Safe under concurrent requests

### Frontend Dashboard

- Built with Next.js (App Router)
- Clean wallet cards UI
- Wallet detail view with live balance updates
- Auth-aware navigation bar (Sign in / Sign out)

---

## Architecture Overview

```
┌────────────┐     JWT / API Key     ┌──────────────┐
│  Frontend  │ ───────────────────▶ │ API Gateway  │
│  Next.js   │                      └──────┬───────┘
│  (Vercel)  │                             │
└────────────┘                             ▼
                                      ┌──────────────┐
                                      │ AWS Lambda   │
                                      │ Wallet API   │
                                      └──────┬───────┘
                                             ▼
                                      ┌──────────────┐
                                      │ DynamoDB     │
                                      │ WalletsTable │
                                      └──────────────┘
                                             ▲
                                      ┌──────────────┐
                                      │ AWS Cognito  │
                                      │ User Pool    │
                                      └──────────────┘
```

---

## Tech Stack

### Frontend

- **Next.js** (App Router)
- **React** 19
- **Tailwind CSS** 4
- **react-oidc-context**
- Deployed on **Vercel**

### Backend

- **AWS Lambda** (Node.js 20)
- **AWS API Gateway** (REST API)
- **AWS DynamoDB**
- **AWS Cognito**
- **AWS SAM** (Infrastructure as Code)

---

## Project Structure

```
BalanceGate/
├─ frontend/                 # Next.js frontend
│  ├─ app/
│  │  ├─ wallets/            # Wallet list & details
│  │  ├─ create/             # Create wallet page
│  │  ├─ fetch/              # Fetch wallet page
│  │  ├─ components/         # Reusable components
│  │  │  ├─ Navbar.tsx
│  │  │  └─ WalletCard.tsx
│  │  ├─ auth-provider.tsx
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  └─ public/
│
├─ src/                      # Lambda source
│  ├─ app.mjs                # Main handler
│  ├─ package.json
│  └─ tests/
│     └─ unit/
│        └─ test-handler.mjs
│
├─ events/                   # Test event payloads
│  └─ event.json
│
├─ template.yaml             # AWS SAM template
├─ samconfig.toml            # SAM CLI configuration
└─ README.md
```

---

## API Endpoints

**All endpoints require:**

- `Authorization: Bearer <JWT>`
- `x-api-key: <API_KEY>`

| Method | Endpoint                           | Description           |
| ------ | ---------------------------------- | --------------------- |
| POST   | `/wallet`                        | Create a new wallet   |
| GET    | `/wallet/{walletId}`             | Get wallet details    |
| GET    | `/wallets`                       | List user wallets     |
| POST   | `/wallet/{walletId}/transaction` | Credit / debit wallet |

---

## Security Design

- **JWT validation** ensures authenticated access
- **User ownership checks** prevent cross-user access
- **Atomic DynamoDB updates** prevent race conditions
- **API key enforcement** adds an extra protection layer
- **CORS handled** via SAM Globals (no manual OPTIONS hacks)

---

## Local Development

### Backend

```bash
sam build
sam local start-api
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_API_KEY=your_api_gateway_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Testing

### Backend Tests

The backend includes comprehensive unit tests using **Mocha** and **Chai**.

**Test Coverage:**

- CORS preflight handling
- JWT authentication and authorization
- Wallet creation (with custom and default values)
- Transaction validation
- Error handling for invalid requests
- Method not allowed scenarios

**Run tests:**

```bash
cd src
npm install
npm test
```

**Test Location:** `src/tests/unit/test-handler.mjs`

---

## Deployment

### Backend

Deployed using **AWS SAM**:

```bash
sam build
sam deploy --guided
```

Infrastructure managed via CloudFormation.

### Frontend

Deployed on **Vercel**:

- Connected to AWS backend via environment variables
- Cognito callback URLs configured for production domain

---

## Key Engineering Decisions

- Used **DynamoDB conditional updates** for safe balance handling
- Avoided client-side balance calculations
- Used **plural resource routing** (`/wallets`) for REST clarity
- Separated frontend routes from backend API paths
- Followed **least-privilege IAM policies**

---

## Future Improvements

- Transaction history table & UI
- Pagination for wallet lists
- Replace Scan with Query + GSI on userId
- Role-based access (admin / user)
- Integration tests with DynamoDB local
- End-to-end frontend tests

---

## Author

**Ravija Dulnath**
Full-Stack Developer | Serverless & Cloud Enthusiast

---

## Use the SAM CLI to build and test locally

Build your application with the `sam build` command.

```bash
BalanceGate$ sam build
```

The SAM CLI installs dependencies defined in `hello-world/package.json`, creates a deployment package, and saves it in the `.aws-sam/build` folder.

Test a single function by invoking it directly with a test event. An event is a JSON document that represents the input that the function receives from the event source. Test events are included in the `events` folder in this project.

Run functions locally and invoke them with the `sam local invoke` command.

```bash
BalanceGate$ sam local invoke HelloWorldFunction --event events/event.json
```

The SAM CLI can also emulate your application's API. Use the `sam local start-api` to run the API locally on port 3000.

```bash
BalanceGate$ sam local start-api
BalanceGate$ curl http://localhost:3000/
```

The SAM CLI reads the application template to determine the API's routes and the functions that they invoke. The `Events` property on each function's definition includes the route and method for each path.

```yaml
      Events:
        HelloWorld:
          Type: Api
          Properties:
            Path: /hello
            Method: get
```

## Add a resource to your application

The application template uses AWS Serverless Application Model (AWS SAM) to define application resources. AWS SAM is an extension of AWS CloudFormation with a simpler syntax for configuring common serverless application resources such as functions, triggers, and APIs. For resources not included in [the SAM specification](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md), you can use standard [AWS CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html) resource types.

## Fetch, tail, and filter Lambda function logs

To simplify troubleshooting, SAM CLI has a command called `sam logs`. `sam logs` lets you fetch logs generated by your deployed Lambda function from the command line. In addition to printing the logs on the terminal, this command has several nifty features to help you quickly find the bug.

`NOTE`: This command works for all AWS Lambda functions; not just the ones you deploy using SAM.

```bash
BalanceGate$ sam logs -n HelloWorldFunction --stack-name BalanceGate --tail
```

You can find more information and examples about filtering Lambda function logs in the [SAM CLI Documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-logging.html).

## Unit tests

Tests are defined in the `hello-world/tests` folder in this project. Use NPM to install the [Mocha test framework](https://mochajs.org/) and run unit tests.

```bash
BalanceGate$ cd hello-world
hello-world$ npm install
hello-world$ npm run test
```

## Cleanup

To delete the sample application that you created, use the AWS CLI. Assuming you used your project name for the stack name, you can run the following:

```bash
sam delete --stack-name BalanceGate
```

## Resources

See the [AWS SAM developer guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) for an introduction to SAM specification, the SAM CLI, and serverless application concepts.

Next, you can use AWS Serverless Application Repository to deploy ready to use Apps that go beyond hello world samples and learn how authors developed their applications: [AWS Serverless Application Repository main page](https://aws.amazon.com/serverless/serverlessrepo/)

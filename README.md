# 📞 Contact Center Knowledge Management Tool (KMT)

A terminal-based, interactive decision-tree tool that helps customer support agents quickly find the correct resolution for any customer query — no guesswork, no digging through wikis.

---

## 🚀 Setup & Run

### Prerequisites
- [Node.js](https://nodejs.org/) **v18 or higher**

### 1. Install dependencies

```bash
cd /path/to/AD_TERMINAL_PROJECT
npm install
```

### 2. Start the tool

```bash
node index.js
```

---

## 🗂 Project Structure

```
AD_TERMINAL_PROJECT/
│
├── index.js          ← Entry point — boots the app
├── cli.js            ← All CLI/UI logic (menus, traversal, display)
├── utils.js          ← Helper functions (logging, search, formatting)
│
├── data/
│   └── tree.js       ← The full decision tree data structure
│
├── logs.json         ← Auto-created on first session; stores usage logs
├── package.json
└── README.md
```

---

## 🌳 How It Works

### Decision Tree
The core data lives in `data/tree.js` as a nested JavaScript object.

- **Question nodes** look like:
  ```js
  {
    question: "What is the billing issue?",
    options: {
      "Incorrect charge": { /* another node */ },
      "Refund request":   { /* another node */ },
    }
  }
  ```

- **Leaf (resolution) nodes** look like:
  ```js
  {
    resolution: "Process a billing adjustment...",
    escalate:   false,
    steps: [
      "Pull up the customer's billing statement.",
      "Apply a one-time credit...",
    ]
  }
  ```

### Traversal Engine (`cli.js` → `runTraversal`)
1. Reads the current node.
2. If it's a question node → shows the question + options via `inquirer` selectable list.
3. Records the choice in the session path and recurses into the chosen child node.
4. If the chosen node is a leaf → renders the resolution card and logs the session.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Interactive menus** | Arrow-key selectable lists powered by `inquirer` |
| **Go Back** | At every step, choose ⬅ Go Back to return to the previous question |
| **Colour-coded output** | `chalk` — green for direct resolutions, yellow for escalations |
| **Keyword Search** | Type `refund`, `OTP`, `locked`, etc. to jump directly to a relevant branch |
| **Session logging** | Every completed query is saved to `logs.json` with timestamp + path taken |
| **Usage Log viewer** | View the last 15 sessions directly from the main menu |
| **ASCII banner** | Rendered with `figlet` on startup |

---

## 🌐 Decision Tree Coverage

| Category | Sub-categories | Resolution leaves |
|---|---|---|
| 💳 Billing | Incorrect charge, Subscription confusion, Refund requests | 7 |
| 🔧 Technical Issues | App/web loading, Payment processing, Feature bugs | 6 |
| 🔐 Account Access | Forgot password, Account locked, 2FA issues | 7 |
| 📦 Order / Delivery | Not shipped, Not delivered, Wrong item, Cancellation | 8 |

**Total: ~28 resolution paths** across 3–4 levels of questioning.

---

## 📋 Sample Session

```
❓  What is the nature of the customer's issue?
   ❯  💳  Billing
      🔧  Technical Issues
      🔐  Account Access
      📦  Order / Delivery

❓  What is the billing issue?
   ❯  Incorrect charge on account
      Subscription or plan pricing confusion
      Refund request

❓  What is the reason for the refund?
   ❯  Product not received
      Product defective or not as described
      Changed mind / no longer needed

✔  RESOLUTION FOUND  You can resolve this case directly.

  Resolution: Initiate a full refund and open a delivery investigation.

  Action Steps:
  1. Verify the order status in the system.
  2. Confirm shipping carrier tracking information.
  3. If delivery is marked complete but customer denies receipt, file a non-delivery claim.
  4. Issue a full refund within 5–7 business days.
  5. Send refund confirmation email.
```

---

## 📝 Extending the Tree

To add a new branch:
1. Open `data/tree.js`.
2. Find the appropriate parent node's `options` object.
3. Add a new key (the option label) and a new node value (either a question node or a leaf node).

No other files need to change — the traversal engine handles any tree shape automatically.

---

## 🛠 Tech Stack

| Package | Purpose |
|---|---|
| [`inquirer`](https://github.com/SBoudrias/Inquirer.js) | Interactive terminal prompts & selectable lists |
| [`chalk`](https://github.com/chalk/chalk) | Terminal colours and styling |
| [`figlet`](https://github.com/patorjk/figlet.js) | ASCII art banner |
| Node.js `fs` | Reading/writing `logs.json` |

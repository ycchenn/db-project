# DBMS Example Project

## Introduction

This project is part of an example of a full-stack web app.

Specifically, the backend part.

This server supports the basic User signup & login functions, also the add & search for coupons.

## Requirements

- NodeJS >= 18
- pnpm
- MySQL

## Installation

### Step 1: Clone & Goto the Project

```shell
$ git clone git@github.com:i-am-harveyt/dbms-example-project.git
$ cd dbms-example-project
```

### (Optional) Step 2: Database Setup

1. Run SQL statements in `db/init.sql`. Paste them into your mysql client(e.g. tableplus), and run.
2. Goto `lib/constants.js`, update the properties in `MySQL` to fit in your dev env.

### Step 3: Install Dependencies

```shell
$ pnpm install
```

### Step 4: Run the Server

```shell
$ pnpm  run dev
```

## Endpoints

### User

#### `POST` `/api/v1/user/signup`

Headers:

| Key          | Value  |
| ------------ | ------ |
| Content-Type | `json` |

Data:

| Name     | Type     | Note     |
| -------- | -------- | -------- |
| name     | `string` | Required |
| email    | `string` | Required |
| password | `string` | Required |

Return:

- `status`

```json
{
  "status": "ok"
}
```

#### `POST` `/api/v1/user/login`

Headers:

| Key          | Value  |
| ------------ | ------ |
| Content-Type | `json` |

Data:

| Name     | Type     | Note     |
| -------- | -------- | -------- |
| email    | `string` | Required |
| password | `string` | Required |

Return:

- `id`: the id of user,
- `token`: the Bearer JWT

```json
{
  "id": 1,
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiZXhwIjoxNzM5Mjg4NTc3fQ.3atOvmwQBx0kVzedbjzBazSva9jxsyeLgqDVJ4iFK6U"
}
```

### Coupon

#### `GET` `/api/v1/coupon/`

Queries:

| Name     | Type      | Note                                       |
| -------- | --------- | ------------------------------------------ |
| keyword  | `string`  | Optional                                   |
| brand    | `string`  | Optional                                   |
| location | `string`  | Optional                                   |
| archived | `boolean` | Optional                                   |
| since    | `int`     | Optional, the ended coupon ID of this page |

#### `POST` `/api/v1/coupon/`

Headers:

| Key           | Value        |
| ------------- | ------------ |
| Content-Type  | `json`       |
| Authorization | `Bearer ...` |

Body:

| Name            | Type     | Note                  |
| --------------- | -------- | --------------------- |
| `title`         | `string` |                       |
| `description`   | `string` | Optional              |
| `brand`         | `string` | Optional              |
| `location`      | `string` | Optional              |
| `discountStart` | `string` | ISO String            |
| `discountEnd`   | `string` | ISO String            |
| `currency`      | `string` | Optional              |
| `discountNum`   | `number` |                       |
| `discountType`  | `string` | `percent` or `amount` |
| `uploadDate`    | `string` | Optional, ISO String  |

Return:

- `status`

```json
{
  "status": "ok"
}
```

# SintoCheck API

### Tech Stack

- Express.js
- Prisma

## Endpoints

Most endpoints require a JWT token to be passed in the `Authorization` header of the request. The token can be obtained by logging in.

---

### Sign up a new patient

Creates a new `Patient` record in the database with the provided information.

- **URL:** `/signup/patient`
- **Method:** `POST`
- **Request Body:**

| Field               | Type    | Required | Description                          |
| ------------------- | ------- | -------- | ------------------------------------ |
| `name`              | string  | Yes      | Name of the patient                  |
| `phone`             | string  | Yes      | Phone number of the patient          |
| `password`          | string  | Yes      | Password for the patient             |
| `birthdate`         | string?  | No       | Date of birth of the patient         |
| `height`            | number?  | No       | Height of the patient in centimeters |
| `weight`            | number?  | No       | Weight of the patient in kilograms   |
| `medicine`          | string?  | No       | Medication taken by the patient      |
| `medicalBackground` | string?  | No       | Medical background of the patient    |

- **Success Response:**
  - **Status Code:** `200 OK`
  - **Response Body:**

    | Field               | Type   | Description            |
    | ------------------- | ------ | ---------------------- |
    | `id`                | string | ID of the patient record |
    | `name`              | string | Name of the patient      |
    | `phone`             | string | Phone number of the patient |
    | `password`          | string | Password for the patient |
    | `birthdate`         | string | Date of birth of the patient |
    | `height`            | number | Height of the patient in centimeters |
    | `weight`            | number | Weight of the patient in kilograms |
    | `medicine`          | string | Medication taken by the patient |
    | `medicalBackground` | string | Medical background of the patient |
    | `createdAt`         | string | Timestamp of when the record was created |

- **Error Response:**
  - **Status Code:** `400 Bad Request`
  - **Response Body:**

    | Field   | Type   | Description                            |
    | ------- | ------ | -------------------------------------- |
    | `error` | string | Error message describing the validation error |

---

### Sign up a new doctor

Creates a new `Doctor` record in the database with the provided information.

- **URL:** `/signup/doctor`
- **Method:** `POST`
- **Request Body:**

| Field       | Type   | Required | Description            |
| ----------- | ------ | -------- | ---------------------- |
| `name`      | string | Yes      | Name of the doctor      |
| `phone`     | string | Yes      | Phone number of the doctor |
| `password`  | string | Yes      | Password for the doctor |
| `speciality` | string | Yes      | Speciality of the doctor |
| `address`   | string | Yes      | Address of the doctor |

- **Success Response:**
  - **Status Code:** `200 OK`
  - **Response Body:**

    | Field       | Type   | Description            |
    | ----------- | ------ | ---------------------- |
    | `id`        | string | ID of the doctor record |
    | `name`      | string | Name of the doctor      |
    | `phone`     | string | Phone number of the doctor |
    | `password`  | string | Password for the doctor |
    | `speciality` | string | Speciality of the doctor |
    | `address`   | string | Address of the doctor |
    | `createdAt` | string | Timestamp of when the record was created |

- **Error Response:**
  - **Status Code:** `400 Bad Request`
  - **Response Body:**

    | Field   | Type   | Description                            |
    | ------- | ------ | -------------------------------------- |
    | `error` | string | Error message describing the validation error |

---

### Get a list of common health data

Returns a list of common `HealthData` records from the database.

- **URL:** `/HealthData`
- **Method:** `GET`
- **Authorization:** Required
- **Success Response:**
  - **Status Code:** `200 OK`
  - **Response Body:**

    | Field      | Type   | Description            |
    | ---------- | ------ | ---------------------- |
    | `id`       | string | ID of the health data record |
    | `name`     | string | Name of the health data   |
    | `unit`     | string | Unit of measurement for the health data |
    | `createdAt` | string | Timestamp of when the record was created |

- **Error Response:**
  - **Status Code:** `401 Unauthorized`
  - **Response Body:**

    | Field   | Type   | Description                            |
    | ------- | ------ | -------------------------------------- |
    | `error` | string | Error message describing the authorization error |

---

### Get a list of personalized health data for a patient

Returns a list of personalized `HealthDataRecord` records for a patient from the database.

- **URL:** `/PersonalizedHealthData/:id`
- **Method:** `GET`
- **Authorization:** Required
- **URL Parameters:**

| Parameter | Type   | Required | Description            |
| --------- | ------ | -------- | ---------------------- |
| `id`      | string | Yes      | ID of the patient record |

- **Success Response:**
  - **Status Code:** `200 OK`
  - **Response Body:**

    | Field      | Type   | Description            |
    | ---------- | ------ | ---------------------- |
    | `id`       | string | ID of the health data record |
    | `name`     | string | Name of the health data   |
    | `value`    | number | Value of the health data  |
    | `unit`     | string | Unit of measurement for the health data |
    | `createdAt` | string | Timestamp of when the record was created |

- **Error Response:**
  - **Status Code:** `401 Unauthorized`
  - **Response Body:**

    | Field   | Type   | Description                            |
    | ------- | ------ | -------------------------------------- |
    | `error` | string | Error message describing the authorization error |

---

### Get a list of tracked health data for a patient

Returns a list of tracked `HealthDataRecord` records for a patient from the database.

- **URL:** `/TrackedHealthData/:id`
- **Method:** `GET`
- **Authorization:** Required
- **URL Parameters:**

| Parameter | Type   | Required | Description            |
| --------- | ------ | -------- | ---------------------- |
| `id`      | string | Yes      | ID of the patient record |

- **Success Response:**
  - **Status Code:** `200 OK`
  - **Response Body:**

    | Field      | Type   | Description            |
    | ---------- | ------ | ---------------------- |
    | `id`       | string | ID of the health data record |
    | `name`     | string | Name of the health data   |
    | `value`    | number | Value of the health data  |
    | `unit`     | string | Unit of measurement for the health data |
    | `createdAt` | string | Timestamp of when the record was created |

- **Error Response:**
  - **Status Code:** `401 Unauthorized`
  - **Response Body:**

    | Field   | Type   | Description                            |
    | ------- | ------ | -------------------------------------- |
    | `error` | string | Error message describing the authorization error |

---

### Create a new health data record for a patient

Creates a new `HealthDataRecord` record in the database with the provided information.

- **URL:** `/HealthDataRecord`
- **Method:** `POST`
- **Authorization:** Required
- **Request Body:**

| Field      | Type   | Required | Description            |
| ---------- | ------ | -------- | ---------------------- |
| `name`     | string | Yes      | Name of the health data   |
| `value`    | number | Yes      | Value of the health data  |
| `unit`     | string | Yes      | Unit of measurement for the health data |
| `patientId` | string | Yes      | ID of the patient record |

- **Success Response:**
  - **Status Code:** `200 OK`
  - **Response Body:**

    | Field      | Type   | Description            |
    | ---------- | ------ | ---------------------- |
    | `id`       | string | ID of the health data record |
    | `name`     | string | Name of the health data   |
    | `value`    | number | Value of the health data  |
    | `unit`     | string | Unit of measurement for the health data |
    | `createdAt` | string | Timestamp of when the record was created |

- **Error Response:**
  - **Status Code:** `401 Unauthorized`
  - **Response Body:**

    | Field   | Type   | Description                            |
    | ------- | ------ | -------------------------------------- |
    | `error` | string | Error message describing the authorization error |

---

### Update an existing health data record for a patient

Updates an existing `HealthDataRecord` record in the database with the provided information.

- **URL:** `/HealthDataRecord/:id`
- **Method:** `PUT`
- **Authorization:** Required
- **URL Parameters:**

| Parameter | Type   | Required | Description            |
| --------- | ------ | -------- | ---------------------- |
| `id`      | string | Yes      | ID of the health data record |

- **Request Body:**

| Field      | Type   | Required | Description            |
| ---------- | ------ | -------- | ---------------------- |
| `name`     | string | No       | Name of the health data   |
| `value`    | number | No       | Value of the health data  |
| `unit`     | string | No       | Unit of measurement for the health data |

- **Success Response:**
  - **Status Code:** `200 OK`
  - **Response Body:**

    | Field      | Type   | Description            |
    | ---------- | ------ | ---------------------- |
    | `id`       | string | ID of the health data record |
    | `name`     | string | Name of the health data   |
    | `value`    | number | Value of the health data  |
    | `unit`     | string | Unit of measurement for the health data |
    | `createdAt` | string | Timestamp of when the record was created |
    | `updatedAt` | string | Timestamp of when the record was last updated |

- **Error Response:**
  - **Status Code:** `401 Unauthorized`
  - **Response Body:**

    | Field   | Type   | Description                            |
    | ------- | ------ | -------------------------------------- |
    | `error` | string | Error message describing the authorization error |
  - **Status Code:** `404 Not Found`
  - **Response Body:**

    | Field   | Type   | Description                            |
    | ------- | ------ | -------------------------------------- |
    | `error` | string | Error message describing the record not found error |

---

### Delete an existing health data record for a patient

Deletes an existing `HealthDataRecord` record from the database.

- **URL:** `/HealthDataRecord/:id`
- **Method:** `DELETE`
- **Authorization:** Required
- **URL Parameters:**

| Parameter | Type   | Required | Description            |
| --------- | ------ | -------- | ---------------------- |
| `id`      | string | Yes      | ID of the health data record |

- **Success Response:**
  - **Status Code:** `204 No Content`

- **Error Response:**
  - **Status Code:** `401 Unauthorized`
  - **Response Body:**

    | Field   | Type   | Description                            |
    | ------- | ------ | -------------------------------------- |
    | `error` | string | Error message describing the authorization error |
  - **Status Code:** `404 Not Found`
  - **Response Body:**

    | Field   | Type   | Description                            |
    | ------- | ------ | -------------------------------------- |
    | `error` | string | Error message describing the record not found error |

---

### Get a list of notes for a patient

Returns a list of `Note` records for a patient from the database.

- **URL:** `/Notes/:id`
- **Method:** `GET`
- **Authorization:** Required
- **URL Parameters:**

| Parameter | Type   | Required | Description            |
| --------- | ------ | -------- | ---------------------- |
| `id`      | string | Yes      | ID of the patient record |

- **Success Response:**
  - **Status Code:** `200 OK`
  - **Response Body:**

    | Field      | Type   | Description            |
    | ---------- | ------ | ---------------------- |
    | `id`       | string | ID of the note record   |
    | `text`     | string | Text of the note        |
    | `createdAt` | string | Timestamp of when the record was created |

- **Error Response:**
  - **Status Code:** `401 Unauthorized`
  - **Response Body:**

    | Field   | Type   | Description                            |
    | ------- | ------ | -------------------------------------- |
    | `error` | string | Error message describing the authorization error |

---

### Create a new note for a patient

Creates a new `Note` record in the database with the provided information.

- **URL:** `/Note`
- **Method:** `POST`
- **Authorization:** Required
- **Request Body:**

| Field      | Type   | Required | Description            |
| ---------- | ------ | -------- | ---------------------- |
| `text`     | string | Yes      | Text of the note        |
| `patientId` | string | Yes      | ID of the patient record |

- **Success Response:**
  - **Status Code:** `200 OK`
  - **Response Body:**

    | Field      | Type   | Description            |
    | ---------- | ------ | ---------------------- |
    | `id`       | string | ID of the note record   |
    | `text`     | string | Text of the note        |
    | `createdAt` | string | Timestamp of when the record was created |

- **Error Response:**
  - **Status Code:** `401 Unauthorized`
  - **Response Body:**

    | Field   | Type   | Description                            |
    | ------- | ------ | -------------------------------------- |
    | `error` | string | Error message describing the authorization error |

---

### Update an existing note for a patient

Updates an existing `Note` record in the database with the provided information.

- **URL:** `/Note/:id`
- **Method:** `PUT`
- **Authorization:** Required
- **URL Parameters:**

| Parameter | Type   | Required | Description            |
| --------- | ------ | -------- | ---------------------- |
| `id`      | string | Yes      | ID of the note record   |

- **Request Body:**

| Field      | Type   | Required | Description            |
| ---------- | ------ | -------- | ---------------------- |
| `text`     | string | No       | Text of the note        |

- **Success Response:**
  - **Status Code:** `200 OK`
  - **Response Body:**

    | Field      | Type   | Description            |
    | ---------- | ------ | ---------------------- |
    | `id`       | string | ID of the note record   |
    | `text`     | string | Text of the note        |
    | `createdAt` | string | Timestamp of when the record was created |
    | `updatedAt` | string | Timestamp of when the record was last updated |

- **Error Response:**
  - **Status Code:** `401 Unauthorized`
  - **Response Body:**

    | Field   | Type   | Description                            |
    | ------- | ------ | -------------------------------------- |
    | `error` | string | Error message describing the authorization error |
  - **Status Code:** `404 Not Found`
  - **Response Body:**

    | Field   | Type   | Description                            |
    | ------- | ------ | -------------------------------------- |
    | `error` | string | Error message describing the record not found error |

---

### Delete an existing note for a patient

Deletes an existing `Note` record from the database.

- **URL:** `/Note/:id`
- **Method:** `DELETE`
- **Authorization:** Required
- **URL Parameters:**

| Parameter | Type   | Required | Description            |
| --------- | ------ | -------- | ---------------------- |
| `id`      | string | Yes      | ID of the note record   |

- **Success Response:**
  - **Status Code:** `204 No Content`

- **Error Response:**
  - **Status Code:** `401 Unauthorized`
  - **Response Body:**

    | Field   | Type   | Description                            |
    | ------- | ------ | -------------------------------------- |
    | `error` | string | Error message describing the authorization error |
  - **Status Code:** `404 Not Found`
  - **Response Body:**

    | Field   | Type   | Description                            |
    | ------- | ------ | -------------------------------------- |
    | `error` | string | Error message describing the record not found error |

---

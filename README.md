# Online Job Fair Registration

> ### Developers
>
> - 6770259621 Pachara Boonsarngsuk 
> - 6772077021 Bhuribhat Ratanasanguanvongs

### Non-Functional Requirements

- Security:
    - The system shall authenticate users using username password.
    - The system shall be able to keep user’s transactions confidential.
- Performance:
    - The system shall response to a request in 3 seconds.
- Usability:
    - The system shall be used and test via Postman.

### Constraints

- The system shall be a web API.
- The frontend part of the application is not required.
- The development team shall develop the backend system as REST APIs.
- The database system can be either MongoDB Atlas or MySQL.

### Functional Requirements

1. The system shall allow a user to register by specifying the name, telephone number, email, and password.
2. After registration, the user becomes a registered user, and the system shall allow the user to log in to use the system by specifying the email and password. The system shall allow a registered user to log out.
3. After login, the system shall allow the registered user to book up to 3 interview sessions by specifying the date (during May 10th-13th, 2022) and the preferred companies. The company list is also provided to the user. A company information includes the company name, address, website, description, and telephone number.
4. The system shall allow the registered user to view his interview session bookings.
5. The system shall allow the registered user to edit his interview session bookings.
6. The system shall allow the registered user to delete his interview session bookings.
7. The system shall allow the admin to view any interview session bookings.
8. The system shall allow the admin to edit any interview session bookings.
9. The system shall allow the admin to delete any interview session bookings.

### Additional Requirements

1. The system shall allow registered users to set up their profiles, including GPA and work experience.
2. The system shall allow companies to view the profiles of users who book an interview session.
3. The system shall allow companies to cancel an interview session at least 24 hours in advance.

---

## Environment

Set `config/config.env`

```bash
PORT=5000
NODE_ENV=development

MONGO_URI=

JWT_SECRET=
JWT_EXPIRE=
JWT_COOKIE_EXPIRE=
```

## How To Run The Application

After cloning the repository, you'll need to install the dependencies listed in the `package.json` file. After running `npm install`, the `node_modules` directory will be created, and all required packages will be installed. You can then run the project as usual.

```bash
$ git clone https://github.com/Bhuribhat/Online-Job-Fair-Registration.git
$ cd "Online-Job-Fair-Registration"
$ npm install
$ npm run dev
```

---

## Diagram

### ER Diagram

![ER Diagram](./assets/UML/ERDiagram/erdiagram.svg)

### Class Diagram

![Class Diagram](./assets/UML/CLassDiagram/classdiagram.svg)

### Sequence Diagram

<h4>Auth</h4>

<details><summary>1. Get me</summary>

![GetMe](./assets/UML/SequenceDiagram/Auth/Get%20Me%20(GET).svg)

</details>

<details><summary>2. Login</summary>

![Login](./assets/UML/SequenceDiagram/Auth/Login%20(POST).svg)

</details>

<details><summary>3. Logout</summary>

![Logout](./assets/UML/SequenceDiagram/Auth/Logout%20(GET).svg)

</details>

<details><summary>4. Register</summary>

![Register](./assets/UML/SequenceDiagram/Auth/Register%20(POST).svg)

</details>

<h4>Company</h4>

<details><summary>1. Create a new company</summary>

![Create a new company](./assets/UML/SequenceDiagram/Company/Manage%20Company%20(POST).svg)

</details>

<details><summary>2. Delete a single company</summary>

![Delete a single company](./assets/UML/SequenceDiagram/Company/Manage%20Company%20(DELETE).svg)

</details>

<details><summary>3. Get a single company</summary>

![Get a single company](./assets/UML/SequenceDiagram/Company/Manage%20Company%20(GET%20ONE).svg)

</details>

<details><summary>4. Get all companies</summary>

![Get all companies](./assets/UML/SequenceDiagram/Company/Manage%20Company%20(GET%20ALL).svg)

</details>

<details><summary>5. Update a single company</summary>

![Update a single company](./assets/UML/SequenceDiagram/Company/Manage%20Company%20(PUT).svg)

</details>

<h4>Booking</h4>

<details><summary>1. Create a new booking</summary>

![Create a single booking](./assets/UML/SequenceDiagram/Booking/Manage%20Booking%20(POST).svg)

</details>

<details><summary>2. Delete a single booking</summary>

![Delete a single booking](./assets/UML/SequenceDiagram/Booking/Manage%20Booking%20(DELETE).svg)

</details>

<details><summary>3. Get a single booking</summary>

![Get a single booking](./assets/UML/SequenceDiagram/Booking/Manage%20Booking%20(GET%20ONE).svg)

</details>

<details><summary>4. Get all bookings</summary>

![Get all bookings](./assets/UML/SequenceDiagram/Booking/Manage%20Booking%20(GET%20ALL).svg)

</details>

<details><summary>5. Update a single booking</summary>

![Update a single booking](./assets/UML/SequenceDiagram/Booking/Manage%20Booking%20(PUT).svg)

</details>

---

## __Demo:__ Functional Requirements

### As `User`

#### Auth

1. Register

![User Register](./assets/TestFunction/user/register.png)

2. Login

![User Login](./assets/TestFunction/user/login.png)

3. Get Me

![User Get Me](./assets/TestFunction/user/getme.png)

4. Logout

![User Logout](./assets/TestFunction/user/logout.png)

#### Company
<!-- TODO -->

#### Booking
<!-- TODO -->

---

### As `Admin`

#### Auth

1. Register

![Admin Register](./assets/TestFunction/admin/register.png)

2. Login

![Admin Login](./assets/TestFunction/admin/login.png)

3. Get Me

![Admin Get Me](./assets/TestFunction/admin/getme.png)

4. Logout

![Admin Logout](./assets/TestFunction/admin/logout.png)

#### Company
<!-- TODO -->

#### Booking
<!-- TODO -->
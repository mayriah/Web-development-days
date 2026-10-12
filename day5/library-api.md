# Library Books REST API Design

A RESTful API specification for managing a library's book collection resource.

---

## Base URL
- `https://api.library.example.com/api/v1`

---

## Endpoints

### 1. List All Books
- **Method**: `GET`
- **Path**: `/books`
- **Description**: Retrieves a paginated list of all books available in the library catalog.
- **Request Body**: None (GET requests do not include a body).
- **Success Status Code**: `200 OK`

---

### 2. Get a Single Book
- **Method**: `GET`
- **Path**: `/books/:id`
- **Description**: Retrieves detailed information for a specific book identified by its ID.
- **Request Body**: None.
- **Success Status Code**: `200 OK`

---

### 3. Create a Book
- **Method**: `POST`
- **Path**: `/books`
- **Description**: Adds a new book entry to the library collection.
- **Request Body**:
  ```json
  {
    "title": "Things Fall Apart",
    "author": "Chinua Achebe",
    "isbn": "978-0385474542",
    "publishedYear": 1958,
    "genre": "Historical Fiction",
    "availableCopies": 5
  }
  ```
- **Success Status Code**: `201 Created`

---

### 4. Update a Book
- **Method**: `PUT`
- **Path**: `/books/:id`
- **Description**: Replaces all fields of an existing book identified by its ID with new data.
- **Request Body**:
  ```json
  {
    "title": "Things Fall Apart",
    "author": "Chinua Achebe",
    "isbn": "978-0385474542",
    "publishedYear": 1958,
    "genre": "African Literature",
    "availableCopies": 8
  }
  ```
- **Success Status Code**: `200 OK`

---

### 5. Delete a Book
- **Method**: `DELETE`
- **Path**: `/books/:id`
- **Description**: Removes a specific book from the library catalog using its ID.
- **Request Body**: None.
- **Success Status Code**: `204 No Content`

---

### 6. List Books by Author (Query Parameter)
- **Method**: `GET`
- **Path**: `/books?author={authorName}`
- **Description**: Filters and retrieves all books written by a specific author using a query parameter.
- **Request Body**: None.
- **Success Status Code**: `200 OK`

---

## Standard Error Codes

### 400 Bad Request
- **Explanation**: Returned when the client sends an invalid request, such as malformed JSON syntax, missing mandatory attributes, or invalid data types.
- **Example Scenario**:
  - A client sends a `POST /books` request with a missing required `title` field or a negative number for `availableCopies`:
    ```json
    {
      "author": "Chinua Achebe",
      "availableCopies": -3
    }
    ```
  - **Server Response**: Status `400 Bad Request` with an error message: `{"error": "Field 'title' is required and 'availableCopies' cannot be negative."}`.

---

### 404 Not Found
- **Explanation**: Returned when the requested resource URI or specific resource identifier does not exist on the server.
- **Example Scenario**:
  - A client sends a `GET /books/9999` or `DELETE /books/9999` when no book with ID `9999` exists in the database.
  - **Server Response**: Status `404 Not Found` with an error message: `{"error": "Book with ID 9999 was not found."}`.

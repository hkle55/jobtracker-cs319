# JobTracker

A simple job application tracker for CS319. Sprint 1 lets you add a job application, view saved applications, and keep them after refreshing or reopening the page. Saved applications can also be edited and deleted.

Built with HTML, CSS, and vanilla JavaScript. Data is stored in the browser's `localStorage`. There is no framework, backend, database, or build step. Automated tests use [Vitest](https://vitest.dev/).

## Running the app

1. Clone the repository:

   ```
   git clone git@github.com:hkle55/jobtracker-cs319.git
   cd jobtracker-cs319
   ```

2. Open `index.html` in a web browser, for example by double-clicking it. No installation or server is needed to use the app.

Tested in Google Chrome on macOS.

## Running the tests

The tests need [Node.js](https://nodejs.org/) 22.12 or newer (check with `node -v`).

1. Install the test tools (one time, from the project folder):

   ```
   npm install
   ```

2. Run the tests:

   ```
   npm test
   ```

   `npm run test:watch` reruns the tests whenever a file changes.

Tests live in `tests/`. They cover validation, ID creation, migration of saved data, adding, editing, and deleting by ID, reading, writing, and backing up `localStorage` (using a fake storage object, since Node has no `localStorage`), search and status filtering, and sorting by date or company (including ties, missing or invalid dates, and sorting filtered results). Filtering and sorting tests also check that the saved list is never modified and that Edit and Delete still reach the right application by ID.

## Using the app

1. Fill in company name, position, date applied, and status.
2. Select **Add application**. The application appears under **Saved applications**, to the right of the form on wider screens and below it on small screens.
3. To change an application, select **Edit** next to it. Its details load into the form. Make your changes and select **Save changes**, or select **Cancel edit** to discard them.
4. To remove an application, select **Delete** next to it and confirm.
5. To find applications, type in **Search** above the list. It matches the company name or position, ignores upper and lower case, and matches part of a word (for example, `acme` finds "Acme Labs").
6. To show only one status, choose it from the **Status** dropdown above the list. Choose **All statuses** to show every status.
7. To change the order of the list, choose an option from the **Sort by** dropdown:
   - **Newest first** (default): most recent date applied at the top.
   - **Oldest first**: earliest date applied at the top.
   - **Company A–Z**: alphabetical by company name, ignoring upper and lower case.

Search, status, and sorting work together: the list first keeps only applications that match both the search and the status, then shows those matches in the chosen order. A "Showing X of Y" line tells you how many match. The list updates as soon as you type or change a dropdown.

Searching, filtering, and sorting only change what is displayed. Saved applications are never changed, removed, or reordered by them: they stay in `localStorage` in the order they were added. Edit and Delete find applications by ID, so they work the same in any displayed order.

Applications with the same date (or the same company name, when sorting by company) stay in the order they were added. Applications with a missing or invalid date are listed last when sorting by date.

If a field is blank, the form shows an error naming the missing fields and does not add or save the application.

## Saved data and IDs

Each application is saved with a unique `id`, which Edit and Delete use to find it.

Applications saved before IDs were added (Sprint 1) are upgraded automatically the first time the page loads: each gets an `id`, and all other fields stay the same. Before upgrading, the app copies the original data, exactly as it was, to the `jobtracker.applications.backup` key in `localStorage`. That backup is written once and never overwritten.

## Project structure

| File | Responsibility |
| --- | --- |
| `index.html` | Page structure; loads the scripts in order |
| `style.css` | Styling and the two-column layout |
| `applications.js` | Data rules: validation, ID creation, migration, add/update/delete. No DOM or storage code |
| `storage.js` | Reading, writing, and backing up saved applications |
| `filters.js` | Search and status filtering: decides which applications are shown, without changing them |
| `sorting.js` | Sorting: decides the order applications are shown in, by sorting a copy |
| `app.js` | DOM and event handling: renders the list and connects the form and buttons to the functions above |
| `tests/` | Vitest tests for `applications.js`, `storage.js`, `filters.js`, and `sorting.js` |

`applications.js`, `storage.js`, `filters.js`, and `sorting.js` are plain browser scripts rather than ES modules, so the app still opens by double-clicking `index.html` (browsers block ES modules on `file://` pages). When Node loads them for the tests, they export their functions through `module.exports`.

## Design principles (SOLID)

- **Single Responsibility Principle.** Each script has one reason to change: `storage.js` only changes if how data is saved changes, `applications.js` only if the rules for applications change, `filters.js` only if the rules for which applications are shown change, `sorting.js` only if the rules for their order change, and `app.js` only if the page changes. `app.js` combines them in `renderApplications`: filter, then sort, then display. Before Sprint 2, `app.js` did all of this.
- **Dependency Inversion Principle.** The data and storage functions do not reach for browser features directly; they receive them as arguments. `readApplications(storage)` and the other storage functions accept any object with `getItem` and `setItem`, and `migrateApplications(records, generateId)` and `addApplication` accept the function that makes IDs. The page passes in the real `localStorage` and `createId`; the tests pass a fake storage and a predictable ID generator.

## Known limitations

- Applications are stored only in the browser profile where they were added. They do not appear in other browsers, other profiles, or other devices.
- Clearing the browser's site data deletes saved applications. Private or incognito windows may not keep them after closing.
- Saving requires `localStorage`. If the browser blocks it or storage is full, applications cannot be saved and the app does not show a message about it.
- Opening the app from a different folder or address may show an empty list, depending on the browser, because browsers can store data separately by location.
- Deleted applications cannot be recovered. (The migration backup only holds the data from before IDs were added.)
- Validation only checks that all fields are filled in. Future dates and duplicate applications are accepted.
- The search text, status filter, and sort choice are not saved. Reloading the page resets them (sorting goes back to Newest first).

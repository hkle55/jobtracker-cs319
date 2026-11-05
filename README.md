# JobTracker

A simple job application tracker for CS319. Sprint 1 lets you add a job application, view saved applications, and keep them after refreshing or reopening the page.

Built with HTML, CSS, and vanilla JavaScript. Data is stored in the browser's `localStorage`. There is no framework, backend, database, or build step.

## Running the app

1. Clone the repository:

   ```
   git clone git@github.com:hkle55/jobtracker-cs319.git
   cd jobtracker-cs319
   ```

2. Open `index.html` in a web browser, for example by double-clicking it. No installation or server is needed.

Tested in Google Chrome on macOS.

## Using the app

1. Fill in company name, position, date applied, and status.
2. Select **Add application**. The application appears under **Saved applications**.

If a field is blank, the form shows an error naming the missing fields and does not add the application.

## Known limitations

- Applications are stored only in the browser profile where they were added. They do not appear in other browsers, other profiles, or other devices.
- Clearing the browser's site data deletes saved applications. Private or incognito windows may not keep them after closing.
- Saving requires `localStorage`. If the browser blocks it or storage is full, applications cannot be saved and the app does not show a message about it.
- Opening the app from a different folder or address may show an empty list, depending on the browser, because browsers can store data separately by location.
- Applications cannot be edited or deleted.
- Validation only checks that all fields are filled in. Future dates and duplicate applications are accepted.

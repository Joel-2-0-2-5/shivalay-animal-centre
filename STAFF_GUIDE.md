# Staff guide: keeping the animal list up to date

You only need the Google Sheet, tab **Animals**. You never need to touch the website code.
Changes show on the website within a few minutes.

## Add a new animal
1. Open the Sheet, tab **Animals**. Go to the first empty row.
2. **animal_id:** next number in the list, for example SH-0011. Never reuse an ID, even for an animal who has left.
3. Fill the other columns. Use the dropdown lists where they appear. Dates are written like 2025-01-31.
4. **area_found:** locality only (for example "Sector 135"). Never a house address.
5. Leave **published** as No until the centre has checked the profile. Change it to Yes to show it on the website.
6. Write today's date in **last_updated**.

## Update a status
Change the **status** cell (for example Adoptable to Adopted). Then update **last_updated** to today.

## Add a photo and get a usable link
1. Upload the photo to Google Drive.
2. Right-click the file, choose Share, and set access to "Anyone with the link" (Viewer).
3. Copy the link. It looks like `https://drive.google.com/file/d/FILE_ID/view`.
4. Turn it into: `https://drive.google.com/thumbnail?id=FILE_ID&sz=w800` (replace FILE_ID with the part from your link).
5. Paste that into **photo_url**.
If the photo does not appear on the website, the link has probably stopped working. The site then shows a paw placeholder instead.

## Publish or unpublish
- **published = Yes:** shown on the website.
- **published = No:** hidden. The profile address then shows "Animal not found".

## Retire a record
Set **published** to No and update **last_updated**. Do not delete the row, so the ID is never reused by mistake.

## Rules
- Never put phone numbers, names of adopters, or exact addresses in this sheet. It is public.
- Adoption enquiries and rescue reports stay in the Google Forms response sheets only.

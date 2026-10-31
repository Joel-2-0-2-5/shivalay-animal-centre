# Setup guide (for students)

Do the steps in order. Total time: about 1 to 2 hours.

## 1. Create the Google Sheet
1. Go to sheets.google.com and click **Blank spreadsheet**. Name it "Shivalay Registry".
2. Choose **File > Import > Upload**, pick `animals-template.csv`, set "Import location" to **Replace current sheet**, and click **Import data**.
3. Rename the tab at the bottom to exactly **Animals**.
4. Optional: add a tab **QR_Tags** with columns `tag_id, animal_id, date_issued, notes` for your own records. The website does not read it.

## 2. Add dropdown lists
Select the whole column (click its letter), then **Data > Data validation > Add rule > Dropdown**. Enter these values:
| Column | Values |
|---|---|
| species | Dog, Cat, Other |
| sex | Male, Female, Unknown |
| size | Small, Medium, Large |
| status | In care, Adoptable, Fostered, Adopted, Released after sterilisation |
| vaccinated | Yes, No, Partial |
| sterilised | Yes, No, Unknown |
| ear_notched | Yes, No |
| published | Yes, No |
Spelling must match exactly, or filters will not work.

## 3. Publish the Animals tab as CSV
1. **File > Share > Publish to web**.
2. Choose the **Animals** tab (not "Entire document") and the format **Comma-separated values (.csv)**.
3. Click **Publish**, then copy the link.
4. Paste it into `config.js` as `ANIMALS_CSV_URL: "...link..."`.
Leave it blank to keep using the sample data.

## 4. Create the two Google Forms
**Adoption enquiry form** fields: animal_id, full name, phone, email, locality, home type, experience with animals, message.
**Rescue report form** fields: animal type, locality and landmark, description, urgency, contact number (optional), photo link (optional). Do not use file upload; it forces visitors to sign in.

For each form: **Send > link icon**, copy the link, and paste it into `config.js` (`ADOPT_FORM_URL`, `REPORT_FORM_URL`).

**Find the pre-fill entry ID (adoption form):**
1. In the form, click the three dots at the top right and choose **Get pre-filled link**.
2. Type `TEST` in the animal_id box and click **Get link**, then copy it.
3. In the link, find `entry.123456789=TEST`. Copy `entry.123456789` into `ADOPT_FORM_ANIMAL_ENTRY` in `config.js`.

Make sure each form's responses go to its own Google Sheet (**Responses tab > link to Sheets**). Keep these sheets private.

## 5. Edit config.js
Replace placeholders only. Leave unconfirmed items marked TODO until the centre confirms them. Set `SHOW_SAMPLE_BANNER` to `false` only when the sheet holds real animals the centre has approved.

## 6. Upload to GitHub and enable Pages
Follow the GitHub steps: create a public repository, upload the files keeping the `css`, `js` and `data` folders, then **Settings > Pages > Deploy from a branch > main > / (root)**.

## 7. Set SITE_BASE_URL
Open `config.js` on GitHub (pencil icon) and set `SITE_BASE_URL` to your site address with no trailing slash, for example `https://yourname.github.io/shivalay-animal-centre`. If you later move to a custom domain, change it again and reprint any QR tags.

## 8. Make and test QR tags
1. Open `YOUR-SITE-ADDRESS/qr-tags.html`.
2. Click **Load all adoptable**, or type IDs, then **Make tags**.
3. Print at 100% scale, cut along the dashed lines.
4. Scan one with your phone. It must open the right profile. Also test an ID that does not exist: it should show "Animal not found".

## Test checklist
- Home page loads and shows the sample banner (while it is on).
- With `ANIMALS_CSV_URL` blank, sample animals appear.
- With the real link, your sheet's animals appear (changes may take a few minutes).
- An unpublished ID shows "Animal not found".
- Both forms open, and the animal ID is pre-filled on the adoption form.

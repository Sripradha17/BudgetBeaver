# BUDGET RACCOON — FULL PRODUCT REDESIGN WITH 10 PROVIDED IMAGES

## READ THIS FIRST

I am giving you:

1. My existing Budget Raccoon application
2. 10 finished illustration images
3. A reference screenshot showing the level of product design quality I want

Your job is to redesign the application so the 10 supplied images feel **professionally integrated into the real product UI**.

The images are actual assets.

Do not recreate them.
Do not redraw them.
Do not replace them with SVG.
Do not generate new versions.

Use the actual images I provide.

---

# YOUR PERSONA

You are a:

* Senior Product Designer
* Senior UI/UX Designer
* Visual Art Director
* Editorial Illustration Director
* Frontend Design Engineer

with 15+ years of experience designing:

* fintech applications
* SaaS products
* dashboards
* mobile applications
* editorial product experiences
* responsive web apps

You are a designer first.

You care about:

* hierarchy
* spacing
* composition
* product usability
* visual balance
* image placement
* typography
* data presentation
* responsive layout
* art direction

Your job is NOT simply to place images into cards.

---

# MAIN FAILURE TO AVOID

The previous designs keep doing this:

```text
┌─────────────────────────────────────────┐
│                                         │
│   TEXT                IMAGE             │
│                                         │
│   Heading             Illustration      │
│   Description                           │
│                                         │
└─────────────────────────────────────────┘
```

STOP DOING THIS.

Do not create another:

* 50/50 two-column card
* text-left/image-right hero
* image-right/text-left hero
* generic split card
* generic marketing banner

Do not solve every page using:

```css
display: grid;
grid-template-columns: 1fr 1fr;
```

This layout pattern is specifically prohibited as the default solution.

---

# MOST IMPORTANT RULE

## DO NOT DESIGN A CARD AROUND THE IMAGE.

Instead:

## DESIGN THE PAGE FIRST.

Then integrate the image into the page.

The image is supporting artwork inside a real finance application.

It is not the entire page.

---

# STEP 1 — INSPECT THE EXISTING APPLICATION

Before changing anything, inspect the codebase.

Find:

* the app shell
* navigation
* page components
* dashboard
* expenses
* budget
* income
* goals
* reports
* forms
* charts
* cards
* existing data
* existing state
* responsive styles
* mascot
* design tokens

Understand what already works.

Do not rewrite business logic unnecessarily.

Do not remove working functionality.

---

# STEP 2 — INSPECT ALL 10 IMAGES

Look at every supplied image.

For each one identify:

* main subject
* character position
* character direction
* important objects
* empty space
* background
* mood
* page it fits best
* whether it works best large or small
* whether it works as a hero, section image, empty state, side visual, or background feature

Create an internal mapping like:

```text
Image 1 → Dashboard
Image 2 → Expenses
Image 3 → Budget
Image 4 → Income
Image 5 → Goals
Image 6 → Reports
Image 7 → Empty Expenses
Image 8 → Goal Reached
Image 9 → secondary dashboard/supporting section
Image 10 → secondary goals/reports/supporting section
```

Do not assign images randomly.

---

# STEP 3 — DO NOT USE ONE REPEATED LAYOUT

Every page must have a different composition.

Do NOT use:

```text
TEXT | IMAGE
TEXT | IMAGE
TEXT | IMAGE
TEXT | IMAGE
```

for every page.

That is the exact failure I want you to avoid.

Each page should have a layout that makes sense for its content and its assigned image.

---

# STEP 4 — DESIGN THE DASHBOARD DIFFERENTLY

The Dashboard should feel like a real finance home screen.

It should contain:

* navigation
* greeting
* financial summary
* balance
* income
* expenses
* savings or goals
* spending overview
* recent activity or transactions
* illustration

The illustration should be part of the dashboard composition.

DO NOT make the dashboard only:

```text
Good morning        [IMAGE]
description
safe to spend
```

That is too empty.

Instead, think more like:

```text
┌──────────────────────────────────────────────────────┐
│ HEADER / SEARCH / ACCOUNT                           │
├────────────┬─────────────────────────────────────────┤
│            │                                         │
│ NAV        │  Good morning, Sripradha                │
│            │                                         │
│ Dashboard  │  Financial overview                     │
│ Expenses   │                                         │
│ Budget     │     [illustration used as visual area] │
│ Income     │                                         │
│ Goals      │  Balance  Income  Expenses  Savings     │
│ Reports    │                                         │
│            │  Spending chart      Transactions       │
│            │                                         │
└────────────┴─────────────────────────────────────────┘
```

The illustration should be integrated into this system.

It should not become a giant standalone card.

---

# STEP 5 — USE DIFFERENT LAYOUTS FOR EACH PAGE

## DASHBOARD

Use the illustration as a strong visual feature in the upper dashboard.

Possible treatment:

* large artwork across upper-right
* data cards partially below or around it
* text and metrics integrated into the page
* illustration may overlap the hero area subtly

DO NOT use a simple 50/50 card.

---

## EXPENSES

The Expenses page should be about transactions.

Use:

* filters
* categories
* recurring indicators
* transaction groups
* charts or summaries
* supplied image

The illustration could appear:

* beside the expense summary
* inside an asymmetrical top section
* partially behind a summary panel
* as a narrower supporting visual

The transaction content must remain the focus.

---

## BUDGET

The Budget page should emphasize planning.

Use:

* category budgets
* progress bars
* remaining amounts
* budget status
* edit controls
* supplied image

The image can be used as:

* a vertical supporting visual
* a corner composition
* a background visual behind a header section
* an offset illustration beside budget categories

Do not repeat the Dashboard layout.

---

## INCOME

Use:

* income sources
* monthly total
* recent income
* recurring income
* trend
* supplied image

The layout should feel more open and positive.

You may use a different arrangement such as:

```text
                IMAGE

Monthly Income
───────────────

Source cards      Trend chart
Source cards      Trend chart
```

or another original composition.

Do not use text-left/image-right again.

---

## GOALS

This page should feel more emotional and aspirational.

Use:

* large goal progress
* goal cards
* contribution controls
* timeline
* supplied image

The illustration can receive more visual space here.

Possibly:

```text
        GOAL TITLE / PROGRESS

IMAGE                    GOAL DETAILS

         Contribution history
```

or another asymmetric composition.

---

## REPORTS

This page should be data-focused.

Use:

* charts
* trend summaries
* category insights
* comparisons
* time filters
* supplied image

The image should not dominate.

It can act as:

* a narrow visual accent
* a visual break between report sections
* an upper-corner supporting illustration

Charts remain the main content.

---

## EMPTY EXPENSES

This is one place where the image can be centered.

Use:

* supplied empty-state image
* short message
* one clear action button

Example:

```text
        [IMAGE]

    No expenses yet

Add your first expense to start
tracking your spending.

    [ Add expense ]
```

This is appropriate because it is an empty state.

---

## GOAL REACHED

This page/state can be more visual.

Use:

* supplied celebration image
* progress complete
* goal amount
* achievement message
* next action

This can feel celebratory without becoming a generic card.

---

# STEP 6 — USE ASYMMETRY

Professional layouts are not always equal columns.

Use:

* 60/40
* 70/30
* offset blocks
* layered sections
* overlapping cards
* image bleeding toward an edge
* image partially behind a panel
* content wrapping around visual space
* visual anchors
* varied section heights

Avoid perfect symmetry unless it genuinely helps.

---

# STEP 7 — DO NOT WRAP EVERY IMAGE IN A CARD

This is prohibited:

```jsx
<Card>
  <img src={image} />
</Card>
```

for every page.

Sometimes the image should have:

* no visible container
* only a clipped edge
* a soft gradient behind it
* a subtle background panel
* an irregular layout area
* a partial bleed to the page edge
* overlapping content

The image does not always need a white rounded rectangle.

---

# STEP 8 — DO NOT FORCE 50% WIDTH

Do not automatically write:

```css
grid-template-columns: 1fr 1fr;
```

or:

```css
width: 50%;
```

for the supplied artwork.

Choose image size based on the composition.

Some pages may use:

* 25%
* 30%
* 40%
* 55%
* full width
* background crop

depending on the page.

---

# STEP 9 — USE CROPPING INTENTIONALLY

Study each image.

Determine the focal point.

Do not crop:

* faces
* hands
* important objects
* financial storytelling

Use:

```css
object-fit: cover;
object-position: ...;
```

carefully.

If necessary use different object positions on mobile.

---

# STEP 10 — MOBILE MUST BE REDESIGNED

Do not simply shrink desktop.

For mobile:

* use bottom navigation if appropriate
* stack financial cards
* simplify background detail
* reduce image height
* crop around the subject
* keep important character visible
* move image above or between sections
* keep actions easy to reach

Example:

Desktop:

```text
summary + artwork + financial cards
```

Mobile:

```text
greeting
summary
artwork
financial cards
chart
transactions
```

or another composition that works.

---

# STEP 11 — KEEP THE PRODUCT DATA-RICH

Budget Raccoon is not a landing page.

It is a working finance application.

Do not remove real content in order to make more room for illustrations.

Keep:

* spending information
* budget data
* income data
* goals
* transactions
* charts
* actions
* filters
* forms
* insights

The artwork should enhance the experience.

---

# STEP 12 — KEEP THE EXISTING RACCOON

The existing Budget Raccoon mascot is already approved.

Do not redesign it.

Do not create new raccoon illustrations.

Do not replace it.

Use the existing mascot only where it already makes sense.

---

# STEP 13 — VISUAL STYLE

Use a clean modern fintech visual system.

Aim for:

* sophisticated
* polished
* calm
* friendly
* professional
* visually interesting

Avoid:

* boring white boxes everywhere
* washed-out pastel UI
* neon colors
* pink-heavy palettes
* excessive gradients
* excessive shadows
* huge rounded cards everywhere
* generic startup dashboard styling

Use:

* strong typography
* deliberate whitespace
* clean surfaces
* subtle borders
* controlled shadows
* modern color accents
* clear hierarchy

---

# STEP 14 — CREATE VISUAL RHYTHM

Do not make every section:

```text
white rounded card
white rounded card
white rounded card
white rounded card
```

Mix:

* open page areas
* cards
* charts
* dividers
* image zones
* summary blocks
* highlighted data
* asymmetric sections

The page should feel designed, not templated.

---

# STEP 15 — IMPLEMENTATION RULES

Use the actual supplied image files.

Store them cleanly, for example:

```text
src/assets/illustrations/
```

Give each asset a meaningful name.

Create an asset map if useful:

```js
export const illustrations = {
  dashboard: dashboardImage,
  expenses: expensesImage,
  budget: budgetImage,
  income: incomeImage,
  goals: goalsImage,
  reports: reportsImage,
};
```

Do not create fake replacement illustrations.

---

# STEP 16 — IMPLEMENT ONE PAGE FIRST

IMPORTANT.

Do NOT redesign all pages immediately.

First redesign ONLY THE DASHBOARD.

Use the supplied Dashboard image.

Finish the complete dashboard.

Then:

1. run the application
2. render the dashboard
3. visually inspect it
4. compare it with the provided reference
5. check whether it still looks like a simple two-column grid
6. if yes, redesign it
7. verify desktop
8. verify laptop
9. verify mobile

ONLY after the Dashboard genuinely looks professionally designed should you continue to the remaining pages.

---

# DASHBOARD REJECTION TEST

Before proceeding, inspect the Dashboard.

If the primary composition looks like:

```text
┌─────────────────────────────────┐
│ TEXT            IMAGE           │
│ TEXT            IMAGE           │
│ TEXT            IMAGE           │
└─────────────────────────────────┘
```

REJECT IT.

Do not continue.

Redesign it.

---

# BETTER DASHBOARD STRUCTURE EXAMPLE

This is an example of the TYPE of visual thinking I want:

```text
┌──────────────────────────────────────────────────────────┐
│ Header / Search / Notifications                          │
├──────────────┬───────────────────────────────────────────┤
│              │                                           │
│ Navigation   │  Good morning, Sripradha                  │
│              │                                           │
│              │  Total balance                            │
│              │  $12,480                                  │
│              │                                           │
│              │       ┌──────────────────────────────┐    │
│              │       │                              │    │
│              │       │      PROVIDED ARTWORK        │    │
│              │       │                              │    │
│              │       └──────────────────────────────┘    │
│              │                                           │
│              │  Income        Expenses       Savings     │
│              │                                           │
│              │  ┌────────────────┐ ┌──────────────────┐ │
│              │  │ Spending      │ │ Recent activity  │ │
│              │  │ chart         │ │                  │ │
│              │  └────────────────┘ └──────────────────┘ │
└──────────────┴───────────────────────────────────────────┘
```

But do not copy this literally.

Use it to understand that the page should have MULTIPLE UI relationships, not just two equal columns.

---

# STEP 17 — AFTER DASHBOARD, DESIGN THE OTHER PAGES

Once the Dashboard passes the quality check:

* Expenses
* Budget
* Income
* Goals
* Reports
* Empty Expenses
* Goal Reached

Design each independently.

Do not reuse the same page template.

---

# STEP 18 — RENDER AND INSPECT EVERY PAGE

For every page:

1. run it
2. open it
3. inspect it visually
4. check hierarchy
5. check image scale
6. check whitespace
7. check financial content
8. check image crop
9. check desktop
10. check mobile

Do not rely only on code.

---

# FINAL CHECK

For every page ask:

### Product

Does this still feel like a real finance application?

### Artwork

Does the supplied image feel intentionally integrated?

### Layout

Is this more interesting than a generic two-column card?

### Difference

Does this page have a different composition from the other pages?

### Hierarchy

Can I immediately understand the most important information?

### Mobile

Does the page feel intentionally redesigned for phone?

If any answer is NO:

fix it.

---

# ABSOLUTE FAILURE CONDITIONS

The task is NOT complete if you create:

* text left + image right on every page
* one large card containing both text and artwork
* repeated 50/50 grids
* identical page layouts
* giant empty hero areas
* a landing-page style app
* images randomly inserted between sections
* images placed without considering their composition
* images stretched or distorted
* artwork replacing useful financial content
* generic white rounded cards everywhere

---

# SUCCESS CONDITION

I want the final result to feel like:

**a professional fintech product where illustration, financial information, navigation, charts, cards, and actions were designed together as one system.**

The supplied images should feel like they belong to the application.

They should NOT feel pasted into a template.

---

# FINAL COMMAND

Start from the beginning.

Inspect the application.

Inspect all 10 supplied images.

Then redesign ONLY THE DASHBOARD FIRST.

Do not use a 50/50 split-card layout.

Do not use a generic two-column hero.

Create a richer real product composition.

Run it.

Render it.

Inspect it.

Fix it until it no longer looks like a basic text-and-image grid.

Only then continue to the remaining pages.

DO NOT GIVE ME A PLAN.

DO NOT ASK FOR APPROVAL.

IMPLEMENT IT.

# Shoes Calc (Buty w liczbach) 
#### Live: http://butywliczbach.m-wisniewski.usermd.net

## Goal
Create app where user can check shoes data and *play* with them.

Learn how to create charts in D3.js, read data from MongoDB on back-end and send them to front-end.  

## Stack
#### Front-end
SASS (SCSS)\
Vanilla JS\
JS libraries:
- D3.js

#### Back-end
Node.js
- Expess.js

MongoDB

## Data source
Data has been scraped from online store. In order to do that I use python and *beautifulsoup* libraries.\
MongoDB has been chosen as storage for this project.\
Database has **90 611** documents.

Fields in database:\
*'sex, category, subcategory, priceCat, price, oldPrice, discount, nameFirst, nameSecond, link, imageLink'.*\
Not all fields has been used in project because I did not want to create too complicated project.

## Sections in project.
### Breakdown
In this section user can check numbers of male or female shoes in every category. Main element of this part of app is pie chart. 

### Minmax
Section created od grid layout. This section show shoes with maximum price and minimum price for man's and women's shoes. User can choose category or subacategy and check shoes for each of them. In *shoe container* user can find: *name, category, sucategory, price and image.*

### PriceLevel
Main object of this section is box plot. This chart show price diffrences between groups.\
Groups are on X axis, price is on Y axis.
The essence of plot is in boxes.
- Line in center of boxes show where is median for group, it means that 50% of records ate above this value and 50% are below.
- Top part of box show third quartile (Q3), it means that 25% of records are above this value and 75% are below.
- Bottom part of box show first quartile (Q1), it means that 75% of records are above this value and 25% are below.
- Line above box show max value.
- Line under box show min value.
- Circles show extremes value for each group.

For more information regarding this kind of chart please check statistics books or websites.

User on app can select variable for X Axis: *sex, category or subcategory*.\
Because there are 41 types of subcategory on chart user can see only part of it. Show 42 boxes will not be readable for user.\
It is also possible to sort boxes acording to four option. Sort by: *median, min value, max value* and *max extreme value*.

### Contributors
All photos from Unsplash, made by: 
- Emma Van Sant
- Jakob Owens 
- Camila Damási
- bantersnaps
- Md. Zahid Hasan Joy
- Nicole Geri

SVG from flaticon,
- Freepik 

## Developer:
**Mateusz Wiśniewski**
##### My Goal
I want to learn how to create online charts and dashboards.

Check my other repositories:
https://github.com/mwisniewski1991?tab=repositories
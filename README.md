# Shoes Calc
###### Buty w liczbach

## Goal:
Create app where user can check shoes data and play with them.

## Data source
Data has been scraped from online store. In order to do that I used python and 'beautifulsoup' libraries.
MongoDB has been chosen as storage for this project.
Database has 90 611 documents.
Fields in database:
'sex, category, subcategory, priceCat, price, oldPrice, discount, nameFirst, nameSecond, link, imageLink'
Not all fields has been used in project because I do not want to create too big project.

## Section in project.
#### Breakdown

#### Minmax

#### PriceLevel
Main object of this section is box plot. This chart show price diffrences between groups.Each group is on X axis, Price is on Y axis.
The essence of this plot is in boxes. 
Line in center of boxes show where is median for group, it means thah 50% of records is above this value and 50% is less. 
Top part of box show third quartile (Q3), it means that 25% of records is above this value and 75% is beneath.
Bottom part of box show first quartile (Q1), it means that 75% of records is above this value and 25% is beneath.
Line above box show max value.
Line under box show min value.
Circles show extremes value for each group.
For more information regarding this kind of chart please check statistics books or websites.

User on app can select variable for x Axis sex, category or subcategory. Because there are 41 types of subcategory on chart user can see only part of it. Show 42 boxes will not readable for user.
It is also possible to sort boxes acording to four option. Sort by median, min value, max value and max extreme value.


## Stack
#### Front-end
SASS (SCSS)
Vanilla JS
JS libraries:
- D3.js,
Parcel bundler

#### Back-end
Node.js
Expess.js
MongoDB